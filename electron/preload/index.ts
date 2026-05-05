import { contextBridge, ipcRenderer } from "electron";

import { OPS_IPC } from "../shared/ipc";
import type {
  JsonValue,
  NativeSignInRequest,
  OpsBridge,
  UpdaterStatusEvent,
} from "../shared/ops-api";

const opsBridge: OpsBridge = {
  app: {
    getVersion: () => ipcRenderer.invoke(OPS_IPC.app.getVersion),
  },
  auth: {
    signInWithPassword: (request: NativeSignInRequest) =>
      ipcRenderer.invoke(OPS_IPC.auth.signInWithPassword, request),
  },
  config: {
    consumeSupabaseBootstrapPayload: () =>
      ipcRenderer.invoke(OPS_IPC.config.consumeSupabaseBootstrapPayload),
  },
  settings: {
    get: <T = JsonValue>(key: string) =>
      ipcRenderer.invoke(OPS_IPC.settings.get, key) as Promise<T | null>,
    set: <T = JsonValue>(key: string, value: T) =>
      ipcRenderer.invoke(OPS_IPC.settings.set, key, value),
    delete: (key: string) => ipcRenderer.invoke(OPS_IPC.settings.delete, key),
    getAll: <T = JsonValue>() =>
      ipcRenderer.invoke(OPS_IPC.settings.getAll) as Promise<Record<string, T>>,
    clear: () => ipcRenderer.invoke(OPS_IPC.settings.clear),
    has: (key: string) => ipcRenderer.invoke(OPS_IPC.settings.has, key),
  },
  updater: {
    check: () => ipcRenderer.invoke(OPS_IPC.updater.check),
    downloadAndInstall: () =>
      ipcRenderer.invoke(OPS_IPC.updater.downloadAndInstall),
    onStatus: (listener: (status: UpdaterStatusEvent) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: UpdaterStatusEvent) => {
        listener(status);
      };

      ipcRenderer.on(OPS_IPC.updater.status, handler);
      return () => {
        ipcRenderer.removeListener(OPS_IPC.updater.status, handler);
      };
    },
  },
};

contextBridge.exposeInMainWorld("ops", opsBridge);
