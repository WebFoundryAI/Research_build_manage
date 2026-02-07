/**
 * AdminPage provides controls for administrative users.  The original
 * repositories contained command‑line scripts for migrating data,
 * generating reports and managing user allowances.  In the unified tool,
 * administrators should be able to adjust credit costs, view usage
 * statistics, enable/disable features and manage user roles.  This page
 * currently displays a placeholder describing these responsibilities.
 */
import { useAuth } from "../lib/auth";

export default function AdminPage() {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-gray-700">
          You do not have access to this page. Contact an administrator if you need admin privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="text-gray-700">This area is for administrators only.  Use it to configure credit pricing, review user activity, monitor API usage and update system settings.  Implementation should ensure that only users with `is_admin` set to true can access this page.</p>
    </div>
  );
}
