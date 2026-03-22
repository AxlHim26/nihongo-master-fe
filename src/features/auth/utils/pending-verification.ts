import { isSafeRedirect } from "@/features/auth/utils/redirect";

const PENDING_VERIFICATION_KEY = "miraigo_pending_email_verification";

type PendingVerificationPayload = {
  email: string;
  redirect: string | null;
};

const isBrowser = () => typeof window !== "undefined";

const readPendingVerification = (): PendingVerificationPayload | null => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PENDING_VERIFICATION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as PendingVerificationPayload;
    if (!parsed.email) {
      return null;
    }

    return {
      email: parsed.email,
      redirect: isSafeRedirect(parsed.redirect) ? parsed.redirect : null,
    };
  } catch {
    return null;
  }
};

export const savePendingVerification = (email: string, redirect: string | null) => {
  if (!isBrowser()) {
    return;
  }

  const payload: PendingVerificationPayload = {
    email,
    redirect: isSafeRedirect(redirect) ? redirect : null,
  };

  window.localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(payload));
};

export const resolvePendingVerificationRedirect = (email: string | null, fallback = "/courses") => {
  const pendingVerification = readPendingVerification();
  if (!pendingVerification || !email) {
    return fallback;
  }

  return pendingVerification.email === email && pendingVerification.redirect
    ? pendingVerification.redirect
    : fallback;
};

export const clearPendingVerification = (email?: string | null) => {
  if (!isBrowser()) {
    return;
  }

  const pendingVerification = readPendingVerification();
  if (email && pendingVerification?.email && pendingVerification.email !== email) {
    return;
  }

  window.localStorage.removeItem(PENDING_VERIFICATION_KEY);
};
