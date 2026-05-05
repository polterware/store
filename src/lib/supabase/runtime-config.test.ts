import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpsBridge } from "../../../electron/shared/ops-api";

function createLocalStorageMock(initialValues: Record<string, string> = {}) {
  const store = new Map(Object.entries(initialValues));

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

function createWindowMock(bridge?: OpsBridge, localStorage = createLocalStorageMock()) {
  const eventTarget = new EventTarget();
  return Object.assign(eventTarget, {
    ops: bridge,
    localStorage,
  });
}

function createOpsBridge(overrides: Partial<OpsBridge> = {}): OpsBridge {
  return {
    app: {
      getVersion: vi.fn(),
    },
    auth: {
      signInWithPassword: vi.fn(),
    },
    config: {
      consumeSupabaseBootstrapPayload: vi.fn(),
    },
    settings: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      clear: vi.fn(),
      has: vi.fn(),
    },
    updater: {
      check: vi.fn(),
      downloadAndInstall: vi.fn(),
      onStatus: vi.fn(),
    },
    ...overrides,
  };
}

describe("runtime supabase config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("consumes bootstrap payload through the Electron bridge and persists it locally", async () => {
    const bridge = createOpsBridge({
      config: {
        consumeSupabaseBootstrapPayload: vi.fn().mockResolvedValue({
          url: "https://demo.supabase.co",
          publishableKey: "pk-demo",
          projectRef: "demo",
          updatedAt: "2026-03-05T00:00:00.000Z",
        }),
      },
      settings: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn(),
        getAll: vi.fn(),
        clear: vi.fn(),
        has: vi.fn(),
      },
    });

    vi.stubGlobal("window", createWindowMock(bridge));

    const { refreshResolvedSupabaseConfig } = await import(
      "@/lib/supabase/runtime-config"
    );

    const config = await refreshResolvedSupabaseConfig();

    expect(config).toEqual({
      url: "https://demo.supabase.co",
      publishableKey: "pk-demo",
      projectRef: "demo",
      updatedAt: "2026-03-05T00:00:00.000Z",
      source: "bootstrap",
    });
    expect(bridge.config.consumeSupabaseBootstrapPayload).toHaveBeenCalled();
    expect(bridge.settings.set).toHaveBeenCalledWith(
      "supabase.runtime.connection",
      expect.objectContaining({
        url: "https://demo.supabase.co",
        publishableKey: "pk-demo",
      }),
    );
  });

  it("uses browser localStorage when the Electron bridge is unavailable", async () => {
    const localStorage = createLocalStorageMock({
      "ops.supabase.runtime.connection": JSON.stringify({
        url: "https://browser.supabase.co/",
        publishableKey: "pk-browser",
        projectRef: null,
        updatedAt: "2026-03-06T00:00:00.000Z",
      }),
    });

    vi.stubGlobal("window", createWindowMock(undefined, localStorage));

    const { refreshResolvedSupabaseConfig } = await import(
      "@/lib/supabase/runtime-config"
    );

    await expect(refreshResolvedSupabaseConfig()).resolves.toEqual({
      url: "https://browser.supabase.co",
      publishableKey: "pk-browser",
      projectRef: null,
      updatedAt: "2026-03-06T00:00:00.000Z",
      source: "saved",
    });
  });
});
