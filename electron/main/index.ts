import {
  app,
  BrowserWindow,
  ipcMain,
  net,
  protocol,
  session,
} from "electron";
import log from "electron-log/main.js";
import electronUpdater from "electron-updater";
import type { UpdateInfo } from "electron-updater";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, isAbsolute, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { OPS_IPC } from "../shared/ipc";
import type {
  JsonValue,
  NativeSignInRequest,
  SerializedUpdateInfo,
  SupabaseBootstrapPayload,
  UpdaterCheckResult,
  UpdaterStatusEvent,
} from "../shared/ops-api";

const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ID = "com.polterware.ops";
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;
const rendererRoot = join(__dirname, "../renderer");

let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "ops",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function emitUpdateStatus(status: UpdaterStatusEvent): void {
  mainWindow?.webContents.send(OPS_IPC.updater.status, status);
}

function serializeUpdateInfo(info: UpdateInfo): SerializedUpdateInfo {
  return {
    version: info.version,
    releaseName: info.releaseName ?? null,
    releaseNotes:
      typeof info.releaseNotes === "string" ? info.releaseNotes : null,
    releaseDate: info.releaseDate,
  };
}

function normalizeRendererPath(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const normalized = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");

  if (isAbsolute(normalized) || normalized.includes("..")) {
    return null;
  }

  return normalized.replace(/^[/\\]+/, "");
}

function registerAppProtocol(): void {
  protocol.handle("ops", async (request) => {
    const url = new URL(request.url);
    if (url.hostname !== "app") {
      return new Response("Not found", { status: 404 });
    }

    const normalizedPath = normalizeRendererPath(url.pathname);
    if (!normalizedPath) {
      return new Response("Forbidden", { status: 403 });
    }

    const candidate = join(rendererRoot, normalizedPath);
    const indexPath = join(rendererRoot, "index.html");

    try {
      const candidateStat = await stat(candidate);
      if (candidateStat.isFile()) {
        return net.fetch(pathToFileURL(candidate).toString());
      }
    } catch {
      if (extname(normalizedPath)) {
        return new Response("Not found", { status: 404 });
      }
    }

    return net.fetch(pathToFileURL(indexPath).toString());
  });
}

function getLegacySupabaseBootstrapPayloadPath(): string {
  if (process.platform === "darwin") {
    return join(
      homedir(),
      "Library",
      "Application Support",
      "uru",
      "bootstrap",
      "supabase.json",
    );
  }

  if (process.platform === "win32") {
    return join(
      process.env.APPDATA ?? app.getPath("appData"),
      "uru",
      "bootstrap",
      "supabase.json",
    );
  }

  return join(
    homedir(),
    ".config",
    "uru",
    "bootstrap",
    "supabase.json",
  );
}

function getAppDataRootPath(): string {
  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support");
  }

  if (process.platform === "win32") {
    return process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  }

  return process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
}

function getSupabaseBootstrapPayloadPaths(): Array<string> {
  return [
    join(app.getPath("userData"), "bootstrap", "supabase.json"),
    getLegacySupabaseBootstrapPayloadPath(),
  ];
}

async function consumeSupabaseBootstrapPayload(): Promise<SupabaseBootstrapPayload | null> {
  const payloadPath = getSupabaseBootstrapPayloadPaths().find((candidate) =>
    existsSync(candidate),
  );

  if (!payloadPath) {
    return null;
  }

  const payloadContents = await readFile(payloadPath, "utf8");
  const payload = JSON.parse(payloadContents) as SupabaseBootstrapPayload;
  await rm(payloadPath);
  return payload;
}

function getSettingsPath(): string {
  return join(app.getPath("userData"), "settings.json");
}

async function readSettings(): Promise<Record<string, JsonValue>> {
  try {
    const settings = JSON.parse(await readFile(getSettingsPath(), "utf8"));
    if (settings && typeof settings === "object" && !Array.isArray(settings)) {
      return settings as Record<string, JsonValue>;
    }
  } catch {
    return {};
  }

  return {};
}

async function writeSettings(settings: Record<string, JsonValue>): Promise<void> {
  const settingsPath = getSettingsPath();
  await mkdir(dirname(settingsPath), { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

async function signInWithPasswordViaSupabase(
  request: NativeSignInRequest,
): Promise<unknown> {
  const endpoint = `${request.supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: request.publishableKey,
      Authorization: `Bearer ${request.publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: request.email,
      password: request.password,
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`native_auth_http_${response.status}: ${body}`);
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(
      `native_auth_invalid_json: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle(OPS_IPC.app.getVersion, () => app.getVersion());
  ipcMain.handle(OPS_IPC.auth.signInWithPassword, (_event, request) =>
    signInWithPasswordViaSupabase(request as NativeSignInRequest),
  );
  ipcMain.handle(OPS_IPC.config.consumeSupabaseBootstrapPayload, () =>
    consumeSupabaseBootstrapPayload(),
  );

  ipcMain.handle(OPS_IPC.settings.get, async (_event, key: string) => {
    const settings = await readSettings();
    return settings[key] ?? null;
  });
  ipcMain.handle(
    OPS_IPC.settings.set,
    async (_event, key: string, value: JsonValue) => {
      const settings = await readSettings();
      settings[key] = value;
      await writeSettings(settings);
    },
  );
  ipcMain.handle(OPS_IPC.settings.delete, async (_event, key: string) => {
    const settings = await readSettings();
    delete settings[key];
    await writeSettings(settings);
  });
  ipcMain.handle(OPS_IPC.settings.getAll, () => readSettings());
  ipcMain.handle(OPS_IPC.settings.clear, () => writeSettings({}));
  ipcMain.handle(OPS_IPC.settings.has, async (_event, key: string) => {
    const settings = await readSettings();
    return Object.prototype.hasOwnProperty.call(settings, key);
  });

  ipcMain.handle(OPS_IPC.updater.check, () => checkForUpdates());
  ipcMain.handle(OPS_IPC.updater.downloadAndInstall, () => downloadAndInstall());
}

async function checkForUpdates(): Promise<UpdaterCheckResult> {
  if (!app.isPackaged) {
    return {
      state: "error",
      message: "Update checks require a packaged desktop app.",
    };
  }

  try {
    emitUpdateStatus({ state: "checking" });
    const result = await autoUpdater.checkForUpdates();
    const info = result?.updateInfo;

    if (!info || info.version === app.getVersion()) {
      emitUpdateStatus({ state: "up-to-date" });
      return { state: "up-to-date" };
    }

    const updateInfo = serializeUpdateInfo(info);
    const status = {
      state: "available",
      version: updateInfo.version,
      updateInfo,
    } satisfies UpdaterStatusEvent;
    emitUpdateStatus(status);
    return status;
  } catch (error) {
    const status = {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    } satisfies UpdaterStatusEvent;
    emitUpdateStatus(status);
    return status;
  }
}

async function downloadAndInstall(): Promise<UpdaterStatusEvent> {
  if (!app.isPackaged) {
    return {
      state: "error",
      message: "Update installation requires a packaged desktop app.",
    };
  }

  try {
    await autoUpdater.downloadUpdate();
    const status = { state: "ready" } satisfies UpdaterStatusEvent;
    emitUpdateStatus(status);
    autoUpdater.quitAndInstall(false, true);
    return status;
  } catch (error) {
    const status = {
      state: "error",
      message: error instanceof Error ? error.message : String(error),
    } satisfies UpdaterStatusEvent;
    emitUpdateStatus(status);
    return status;
  }
}

function configureUpdater(): void {
  autoUpdater.autoDownload = false;
  autoUpdater.logger = log;

  autoUpdater.on("checking-for-update", () => {
    emitUpdateStatus({ state: "checking" });
  });
  autoUpdater.on("update-available", (info) => {
    const updateInfo = serializeUpdateInfo(info);
    emitUpdateStatus({
      state: "available",
      version: updateInfo.version,
      updateInfo,
    });
  });
  autoUpdater.on("update-not-available", () => {
    emitUpdateStatus({ state: "up-to-date" });
  });
  autoUpdater.on("download-progress", (progress) => {
    emitUpdateStatus({
      state: "downloading",
      progress: Math.round(progress.percent),
    });
  });
  autoUpdater.on("update-downloaded", () => {
    emitUpdateStatus({ state: "ready" });
  });
  autoUpdater.on("error", (error) => {
    emitUpdateStatus({ state: "error", message: error.message });
  });
}

function isAllowedNavigation(url: string): boolean {
  if (url.startsWith("ops://app/")) {
    return true;
  }

  if (!app.isPackaged && DEV_SERVER_URL) {
    return url.startsWith(DEV_SERVER_URL);
  }

  return false;
}

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    title: "Ops",
    backgroundColor: "#00000000",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 16, y: 10 },
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });

  window.once("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });
  window.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });

  if (!app.isPackaged && DEV_SERVER_URL) {
    void window.loadURL(DEV_SERVER_URL);
  } else {
    void window.loadURL("ops://app/");
  }

  return window;
}

log.initialize();
log.transports.file.level = "info";

app.setName("Ops");
app.setPath("userData", join(getAppDataRootPath(), APP_ID));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  registerAppProtocol();
  configureUpdater();
  registerIpcHandlers();

  mainWindow = createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});
