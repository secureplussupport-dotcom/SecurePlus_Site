import posthog from "posthog-js";

const token = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export const analyticsEnabled = Boolean(token);

if (analyticsEnabled && typeof window !== "undefined") {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-01-30",
    capture_pageview: false,
    autocapture: true,
    person_profiles: "identified_only",
    loaded: (client) => {
      if (import.meta.env.DEV) client.debug(false);
    },
  });
}

export function capture(event, properties = {}) {
  if (!analyticsEnabled) return;
  posthog.capture(event, {
    app: "secureplus",
    ...properties,
  });
}

export function identifyUser(user) {
  if (!analyticsEnabled || !user) return;
  posthog.identify(user.id || user.email, {
    tier: user.tier || "free",
    auth_provider: user.authProvider || "local",
  });
}

export function resetAnalytics() {
  if (!analyticsEnabled) return;
  posthog.reset();
}
