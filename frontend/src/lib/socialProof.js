import { useEffect, useState, useCallback } from "react";
import { api } from "./api";

/**
 * Real social proof — counts come from the backend's interactions collection
 * (distinct ip_hash per treatment per day). NEVER fake. If count is 0, hide.
 */
export function useSocialProof() {
  const [counts, setCounts] = useState({});

  const refresh = useCallback(() => {
    api
      .get("/public/social-proof")
      .then((r) => setCounts(r.data?.counts || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { counts, refresh };
}

export function trackInteraction(treatment_slug, type = "wa_click") {
  if (!treatment_slug) return Promise.resolve();
  return api
    .post("/public/track", { treatment_slug, type })
    .catch(() => {});
}
