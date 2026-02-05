// Supabase Edge Function: Google Search Console OAuth
// Handles OAuth flow for connecting GSC

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  decryptValue,
  encryptValue,
} from "../_shared/secrets.ts";

const GSC_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/webmasters",
].join(" ");

async function getGscCredentials(supabase: ReturnType<typeof getSupabaseClient>, userId: string) {
  const { data: clientIdRow } = await supabase
    .from("user_secrets")
    .select("value_encrypted")
    .eq("user_id", userId)
    .eq("key", "gsc_client_id")
    .single();

  const { data: clientSecretRow } = await supabase
    .from("user_secrets")
    .select("value_encrypted")
    .eq("user_id", userId)
    .eq("key", "gsc_client_secret")
    .single();

  if (!clientIdRow || !clientSecretRow) {
    return null;
  }

  return {
    clientId: await decryptValue(clientIdRow.value_encrypted),
    clientSecret: await decryptValue(clientSecretRow.value_encrypted),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    const body = await req.json();
    const { action, code, redirect_uri } = body;

    // Check connection status
    if (action === "status") {
      const { data: auth } = await supabase
        .from("gsc_auth")
        .select("connected_at, token_expires_at, scope")
        .eq("user_id", user.id)
        .single();

      const isConnected = auth && auth.token_expires_at
        ? new Date(auth.token_expires_at) > new Date()
        : false;

      return corsResponse(req, {
        connected: isConnected,
        connected_at: auth?.connected_at,
        scope: auth?.scope,
      });
    }

    // Get OAuth URL
    if (action === "get_auth_url") {
      const credentials = await getGscCredentials(supabase, user.id);
      if (!credentials) {
        return corsErrorResponse(req, "GSC credentials not configured. Please add them in Settings.", 400);
      }

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", credentials.clientId);
      authUrl.searchParams.set("redirect_uri", redirect_uri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", GSC_SCOPES);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");

      return corsResponse(req, { auth_url: authUrl.toString() });
    }

    // Exchange code for tokens
    if (action === "exchange_code") {
      if (!code || !redirect_uri) {
        return corsErrorResponse(req, "code and redirect_uri are required", 400);
      }

      const credentials = await getGscCredentials(supabase, user.id);
      if (!credentials) {
        return corsErrorResponse(req, "GSC credentials not configured", 400);
      }

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          redirect_uri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return corsErrorResponse(req, `Token exchange failed: ${error}`, 400);
      }

      const tokens = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      // Store tokens encrypted
      const { error } = await supabase.from("gsc_auth").upsert({
        user_id: user.id,
        access_token: await encryptValue(tokens.access_token),
        refresh_token: tokens.refresh_token ? await encryptValue(tokens.refresh_token) : null,
        token_expires_at: expiresAt,
        scope: tokens.scope,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return corsErrorResponse(req, error.message, 500);
      }

      return corsResponse(req, { success: true, connected: true });
    }

    // Disconnect GSC
    if (action === "disconnect") {
      await supabase.from("gsc_auth").delete().eq("user_id", user.id);
      return corsResponse(req, { success: true, connected: false });
    }

    return corsErrorResponse(req, "Invalid action", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
