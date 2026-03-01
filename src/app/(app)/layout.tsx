import AuthGuard from "@/features/auth/components/auth-guard";
import AppShell from "@/shared/components/layout/app-shell";
import CommandPalette from "@/shared/components/layout/command-palette";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <AppShell>
        {children}
        <CommandPalette />
      </AppShell>
    </AuthGuard>
  );
}
