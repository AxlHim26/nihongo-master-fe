"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import { ensureAccessToken } from "@/lib/api-client";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let alive = true;

    const bootstrapAuth = async () => {
      const token = authStorage.getToken() ?? (await ensureAccessToken());
      if (!token) {
        const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${redirect}`);
        return;
      }

      if (alive) {
        setReady(true);
      }
    };

    void bootstrapAuth();

    return () => {
      alive = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <Stack alignItems="center" justifyContent="center" className="min-h-screen">
        <CircularProgress size={32} />
      </Stack>
    );
  }

  return <>{children}</>;
}
