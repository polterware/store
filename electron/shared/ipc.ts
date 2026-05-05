export const OPS_IPC = {
  app: {
    getVersion: "ops:app:get-version",
  },
  auth: {
    signInWithPassword: "ops:auth:sign-in-with-password",
  },
  config: {
    consumeSupabaseBootstrapPayload:
      "ops:config:consume-supabase-bootstrap-payload",
  },
  settings: {
    get: "ops:settings:get",
    set: "ops:settings:set",
    delete: "ops:settings:delete",
    getAll: "ops:settings:get-all",
    clear: "ops:settings:clear",
    has: "ops:settings:has",
  },
  updater: {
    check: "ops:updater:check",
    downloadAndInstall: "ops:updater:download-and-install",
    status: "ops:updater:status",
  },
} as const;
