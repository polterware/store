import { beforeEach, describe, expect, it, vi } from "vitest";

const getOpsBridgeMock = vi.fn();

vi.mock("@/lib/desktop/ops-bridge", () => ({
  getOpsBridge: () => getOpsBridgeMock(),
}));

describe("updater wrapper", () => {
  beforeEach(() => {
    vi.resetModules();
    getOpsBridgeMock.mockReset();
  });

  it("returns a serializable available update status", async () => {
    getOpsBridgeMock.mockReturnValue({
      updater: {
        check: vi.fn().mockResolvedValue({
          state: "available",
          version: "0.2.0",
          updateInfo: {
            version: "0.2.0",
          },
        }),
      },
    });

    const { checkForAppUpdate } = await import("@/lib/updater");

    await expect(checkForAppUpdate()).resolves.toEqual({
      state: "available",
      version: "0.2.0",
    });
  });

  it("maps updater status events before passing them to listeners", async () => {
    const unsubscribeMock = vi.fn();
    const onStatusMock = vi.fn((listener) => {
      listener({
        state: "available",
        version: "0.3.0",
        updateInfo: { version: "0.3.0" },
      });
      return unsubscribeMock;
    });
    getOpsBridgeMock.mockReturnValue({
      updater: {
        onStatus: onStatusMock,
      },
    });

    const { subscribeToAppUpdateStatus } = await import("@/lib/updater");
    const listener = vi.fn();
    const unsubscribe = subscribeToAppUpdateStatus(listener);

    expect(listener).toHaveBeenCalledWith({
      state: "available",
      version: "0.3.0",
    });

    unsubscribe();
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
