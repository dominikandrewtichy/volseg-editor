import { ApiKeysManager } from "../components/api-keys-manager";
import { useTitle } from "../hooks/use-title";

export function SettingsPage() {
  useTitle("Settings");

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <ApiKeysManager />
    </div>
  );
}
