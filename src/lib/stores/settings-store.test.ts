import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpsBridge } from "../../../electron/shared/ops-api";

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
}

function createBridge(): OpsBridge {
  return {
    app: { getVersion: vi.fn() },
    auth: { signInWithPassword: vi.fn() },
    config: { consumeSupabaseBootstrapPayload: vi.fn() },
    settings: {
      get: vi.fn().mockResolvedValue({ days: 30 }),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      getAll: vi.fn().mockResolvedValue({ "dashboard.default_range": { days: 30 } }),
      clear: vi.fn().mockResolvedValue(undefined),
      has: vi.fn().mockResolvedValue(true),
    },
    updater: {
      check: vi.fn(),
      downloadAndInstall: vi.fn(),
      onStatus: vi.fn(),
    },
  };
}

describe("SettingsStore", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("delegates local settings to the Electron bridge when available", async () => {
    const bridge = createBridge();
    vi.stubGlobal(
      "window",
      Object.assign(new EventTarget(), {
        ops: bridge,
        localStorage: createLocalStorageMock(),
      }),
    );

    const { SettingsStore } = await import("@/lib/stores/settings-store");

    await expect(SettingsStore.get("dashboard.default_range")).resolves.toEqual({
      days: 30,
    });
    await SettingsStore.set("dashboard.default_range", { days: 90 });
    await SettingsStore.delete("dashboard.default_range");

    expect(bridge.settings.get).toHaveBeenCalledWith("dashboard.default_range");
    expect(bridge.settings.set).toHaveBeenCalledWith(
      "dashboard.default_range",
      { days: 90 },
    );
    expect(bridge.settings.delete).toHaveBeenCalledWith(
      "dashboard.default_range",
    );
  });

  it("falls back to browser localStorage when no bridge is present", async () => {
    const localStorage = createLocalStorageMock();
    vi.stubGlobal(
      "window",
      Object.assign(new EventTarget(), {
        localStorage,
      }),
    );

    const { SettingsStore } = await import("@/lib/stores/settings-store");

    await SettingsStore.set("dashboard.default_range", { days: 7 });

    await expect(SettingsStore.get("dashboard.default_range")).resolves.toEqual({
      days: 7,
    });
    await expect(SettingsStore.has("dashboard.default_range")).resolves.toBe(
      true,
    );
  });
});
