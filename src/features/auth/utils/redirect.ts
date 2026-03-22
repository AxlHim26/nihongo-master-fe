export const pickSearchParam = (value: string | string[] | null | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

export const isSafeRedirect = (value: string | null) => {
  if (!value) {
    return false;
  }

  return value.startsWith("/") && !value.startsWith("//");
};

export const resolveRedirectTarget = (value: string | null, fallback = "/courses") => {
  const safeRedirect = isSafeRedirect(value) ? value : null;
  return safeRedirect ?? fallback;
};

export const createAuthRoute = (pathname: string, redirect: string | null) => {
  return createAuthRouteWithParams(pathname, redirect);
};

export const createAuthRouteWithParams = (
  pathname: string,
  redirect: string | null,
  params?: Record<string, string | number | boolean | null | undefined>,
) => {
  const search = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      search.set(key, String(value));
    });
  }

  const safeRedirect = isSafeRedirect(redirect) ? redirect : null;
  if (safeRedirect) {
    search.set("redirect", safeRedirect);
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
};
