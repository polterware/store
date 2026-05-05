import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPasswordMock = vi.fn();
const setSessionMock = vi.fn();
const getOpsBridgeMock = vi.fn();

vi.mock("@/lib/desktop/ops-bridge", () => ({
  getOpsBridge: () => getOpsBridgeMock(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
      setSession: setSessionMock,
    },
  }),
  getSupabaseConfig: () => ({
    url: "https://demo.supabase.co",
    publishableDefaultKey: "pk-demo",
  }),
}));

describe("supabase auth", () => {
  beforeEach(() => {
    vi.resetModules();
    signInWithPasswordMock.mockReset();
    setSessionMock.mockReset();
    getOpsBridgeMock.mockReset();
  });

  it("uses the Electron auth fallback when browser auth fails with a network error", async () => {
    const nativeSignInMock = vi.fn().mockResolvedValue({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });

    getOpsBridgeMock.mockReturnValue({
      auth: {
        signInWithPassword: nativeSignInMock,
      },
    });
    signInWithPasswordMock.mockRejectedValue(new Error("failed to fetch"));
    setSessionMock.mockResolvedValue({
      data: {
        user: { id: "user-id" },
        session: { access_token: "access-token" },
      },
      error: null,
    });

    const { signInWithPassword } = await import("@/lib/supabase/auth");
    const result = await signInWithPassword("admin@example.com", "secret");

    expect(nativeSignInMock).toHaveBeenCalledWith({
      supabaseUrl: "https://demo.supabase.co",
      publishableKey: "pk-demo",
      email: "admin@example.com",
      password: "secret",
    });
    expect(setSessionMock).toHaveBeenCalledWith({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });
    expect(result.user).toEqual({ id: "user-id" });
  });
});
