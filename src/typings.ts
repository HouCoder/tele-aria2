export interface TaskItem {
  // Only available when using HTTP.
  bittorrent?: {
    info: {
      name: string;
    };
  };

  files: {
    length: string;
    path: string;
  }[];

  gid: string;
  downloadSpeed: string;
  totalLength: string;
  completedLength: string;
  errorMessage?: string;
}

export interface Aria2Error {
  code: string;
  message: string;
}

export interface Aria2EventParam {
  gid: string;
}

export interface GeneralCallback {
  // Return TaskItem when calling tellStatus API.
  (response: Array<TaskItem> | string | TaskItem): void;
}

export interface Aria2EventCallback {
  (response: Array<Aria2EventParam>): void;
}

// https://aria2.github.io/manual/en/html/aria2c.html#notifications
export type aria2EventTypes = 'downloadStart' | 'downloadPause' | 'downloadStop' | 'downloadComplete' | 'downloadError' | 'btDownloadComplete' | 'error';

export interface Aria2EventCallbacks {
  [propName: string]: Aria2EventCallback;
}

export interface RequestParams {
  method: string;
  params?: (string|number|string[])[] | GeneralCallback;
  callback?: GeneralCallback;
}

export interface GeneralCallbacks {
  [propName: string]: GeneralCallback;
}

export interface UserOptions {
  aria2Server?: string;
  aria2Key?: string;
  token?: string;
  tgBot?: string;
  tgUser?: number;
  proxy?: string;
  maxIndex?: number;
  config?: string;
  verbose?: boolean;
}

export type requiredOption = 'aria2Server' | 'tgBot' | 'tgUser';
