interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    [key: string]: unknown;
  };
  colorScheme: "light" | "dark";
  platform: string;
  version: string;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
