"use client";

import { useEffect } from "react";

import { registerOwnerSiteTools } from "@/lib/owner-site-tools";

export function OwnerSiteTools() {
  useEffect(() => {
    if (window.top !== window.self) return;
    const lifetime = new AbortController();
    const stop = () => lifetime.abort();
    window.addEventListener("pagehide", stop, { once: true });
    void registerOwnerSiteTools(document, lifetime);
    return () => {
      stop();
      window.removeEventListener("pagehide", stop);
    };
  }, []);

  return null;
}
