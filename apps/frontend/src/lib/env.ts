export type EnvFieldDiagnostics = {
  present: boolean;
  length: number;
  last4: string;
  format: "valid" | "invalid";
};

export type SupabaseEnvDiagnostics = {
  url: EnvFieldDiagnostics;
  anonKey: EnvFieldDiagnostics;
  status: "ok" | "warn" | "error";
  errors: string[];
};

function asValue(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function isHttpsUrl(value: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isJwtLike(value: string) {
  if (!value || value.length < 20) return false;
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length >= 4);
}

function toField(value: string, isValid: boolean): EnvFieldDiagnostics {
  return {
    present: Boolean(value),
    length: value.length,
    last4: value ? value.slice(-4) : "",
    format: isValid ? "valid" : "invalid",
  };
}

export function getSupabaseEnvDiagnostics(): SupabaseEnvDiagnostics {
  const url = asValue((import.meta as any).env?.VITE_SUPABASE_URL);
  const anonKey = asValue((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

  const urlValid = isHttpsUrl(url);
  const anonValid = isJwtLike(anonKey);

  const diagnostics: SupabaseEnvDiagnostics = {
    url: toField(url, urlValid),
    anonKey: toField(anonKey, anonValid),
    status: "ok",
    errors: [],
  };

  if (!diagnostics.url.present || !diagnostics.anonKey.present) {
    diagnostics.status = "error";
  }

  if (diagnostics.url.present && !urlValid) diagnostics.errors.push("SUPABASE_URL must be a valid https URL.");
  if (diagnostics.anonKey.present && !anonValid) {
    diagnostics.errors.push("SUPABASE_ANON_KEY must look like a JWT token (xxx.yyy.zzz).");
  }

  if (!diagnostics.url.present) diagnostics.errors.push("SUPABASE_URL is missing.");
  if (!diagnostics.anonKey.present) diagnostics.errors.push("SUPABASE_ANON_KEY is missing.");

  if (diagnostics.status !== "error" && diagnostics.errors.length > 0) {
    diagnostics.status = "warn";
  }

  return diagnostics;
}
