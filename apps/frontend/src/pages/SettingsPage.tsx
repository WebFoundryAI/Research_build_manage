/**
 * SettingsPage allows users to manage personal settings such as their
 * profile information, API keys (if applicable) and notification
 * preferences.  It also provides a place to view credit usage.  In a
 * complete implementation you would fetch user details from the
 * `profiles` and `credits` tables and allow editing.
 */
export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-700">Manage your account settings here.  You will be able to update your profile, view your credit balance and configure notification preferences.  Admins can manage platform‑wide options in the Admin section.</p>
    </div>
  );
}