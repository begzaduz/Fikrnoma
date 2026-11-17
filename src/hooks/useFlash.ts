import { useCallback, useState } from "react";

/** Qisqa vaqtli xabar (toast). */
export function useFlash() {
  const [notice, setNotice] = useState("");
  const flash = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }, []);
  return { notice, flash };
}
