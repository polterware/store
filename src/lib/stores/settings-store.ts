import { getOpsBridge } from "@/lib/desktop/ops-bridge";

const BROWSER_SETTINGS_KEY = "ops.local.settings";

export type LocalSettingValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: LocalSettingValue }
  | Array<LocalSettingValue>;

function readBrowserSettings(): Record<string, LocalSettingValue> {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(BROWSER_SETTINGS_KEY);
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, LocalSettingValue>;
    }
  } catch {
    return {};
  }

  return {};
}

function writeBrowserSettings(settings: Record<string, LocalSettingValue>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BROWSER_SETTINGS_KEY, JSON.stringify(settings));
}

export const SettingsStore = {
  async get<T = LocalSettingValue>(key: string): Promise<T | null> {
    const bridge = getOpsBridge();
    if (bridge) {
      return bridge.settings.get<T>(key);
    }

    const settings = readBrowserSettings();
    return (settings[key] as T | undefined) ?? null;
  },

  async set<T = LocalSettingValue>(key: string, value: T): Promise<void> {
    const bridge = getOpsBridge();
    if (bridge) {
      await bridge.settings.set(key, value);
      return;
    }

    const settings = readBrowserSettings();
    settings[key] = value as LocalSettingValue;
    writeBrowserSettings(settings);
  },

  async delete(key: string): Promise<void> {
    const bridge = getOpsBridge();
    if (bridge) {
      await bridge.settings.delete(key);
      return;
    }

    const settings = readBrowserSettings();
    delete settings[key];
    writeBrowserSettings(settings);
  },

  async getAll<T = LocalSettingValue>(): Promise<Record<string, T>> {
    const bridge = getOpsBridge();
    if (bridge) {
      return bridge.settings.getAll<T>();
    }

    return readBrowserSettings() as Record<string, T>;
  },

  async clear(): Promise<void> {
    const bridge = getOpsBridge();
    if (bridge) {
      await bridge.settings.clear();
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(BROWSER_SETTINGS_KEY);
    }
  },

  async has(key: string): Promise<boolean> {
    const bridge = getOpsBridge();
    if (bridge) {
      return bridge.settings.has(key);
    }

    const settings = readBrowserSettings();
    return Object.prototype.hasOwnProperty.call(settings, key);
  },
};
