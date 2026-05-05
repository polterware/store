export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | Array<JsonValue>;

export interface NativeSignInRequest {
  supabaseUrl: string;
  publishableKey: string;
  email: string;
  password: string;
}
export interface NativeSignInResponse {
  access_token: string;
  refresh_token: string;
}

export interface SupabaseBootstrapPayload {
  url: string;
  publishableKey: string;
  projectRef?: string | null;
  updatedAt?: string;
  source?: string;
}

export interface SerializedUpdateInfo {
  version: string;
  releaseName?: string | null;
  releaseNotes?: string | null;
  releaseDate?: string;
}

export type UpdaterStatusEvent =
  | { state: "checking" }
  | { state: "available"; version: string; updateInfo: SerializedUpdateInfo }
  | { state: "downloading"; progress: number }
  | { state: "ready" }
  | { state: "up-to-date" }
  | { state: "error"; message: string };

export type UpdaterCheckResult =
  | { state: "available"; version: string; updateInfo: SerializedUpdateInfo }
  | { state: "up-to-date" }
  | { state: "error"; message: string };

export interface OpsBridge {
  app: {
    getVersion: () => Promise<string>;
  };
  auth: {
    signInWithPassword: (
      request: NativeSignInRequest,
    ) => Promise<NativeSignInResponse>;
  };
  config: {
    consumeSupabaseBootstrapPayload: () => Promise<SupabaseBootstrapPayload | null>;
  };
  settings: {
    get: <T = JsonValue>(key: string) => Promise<T | null>;
    set: <T = JsonValue>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
    getAll: <T = JsonValue>() => Promise<Record<string, T>>;
    clear: () => Promise<void>;
    has: (key: string) => Promise<boolean>;
  };
  updater: {
    check: () => Promise<UpdaterCheckResult>;
    downloadAndInstall: () => Promise<UpdaterStatusEvent>;
    onStatus: (listener: (status: UpdaterStatusEvent) => void) => () => void;
  };
}
