import { useEffect, useRef } from "react";

const webApp = () => window.Telegram?.WebApp;

/** Telegram eski versiyalarida ba’zi imkoniyatlar yo‘q; xato bermasdan o‘tkazib yuboramiz. */
const supports = (version: string) => {
  try {
    return !!webApp()?.isVersionAtLeast?.(version);
  } catch {
    return false;
  }
};

/** Telegram'ning tebranish (haptic) javobi. Brauzerda hech narsa qilmaydi. */
export const haptic = {
  tap() {
    if (supports("6.1")) webApp()?.HapticFeedback?.impactOccurred("light");
  },
  select() {
    if (supports("6.1")) webApp()?.HapticFeedback?.selectionChanged();
  },
  success() {
    if (supports("6.1")) webApp()?.HapticFeedback?.notificationOccurred("success");
  },
  error() {
    if (supports("6.1")) webApp()?.HapticFeedback?.notificationOccurred("error");
  },
};

/**
 * Telegram'ning "Orqaga" tugmasi. `visible` true bo‘lsa ko‘rinadi va bosilganda `onBack` chaqiriladi.
 * `onBack` har renderda o‘zgarishi mumkin, shuning uchun tugma qayta ulanmaydi.
 */
export function useBackButton(visible: boolean, onBack: () => void) {
  const handler = useRef(onBack);
  handler.current = onBack;

  useEffect(() => {
    const button = webApp()?.BackButton;
    if (!button || !supports("6.1")) return;
    if (!visible) {
      button.hide();
      return;
    }
    const click = () => handler.current();
    button.show();
    button.onClick(click);
    return () => button.offClick(click);
  }, [visible]);
}
