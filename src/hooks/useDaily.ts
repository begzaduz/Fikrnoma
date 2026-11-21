import { useCallback, useEffect, useState } from "react";
import { fetchAnswers, fetchDaily, type DailyState, type Me, type MyAnswer } from "../api";

/** Kunlik savollar, streak, daraja va foydalanuvchining o‘z javoblari. */
export function useDaily(me: Me | null) {
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [answers, setAnswers] = useState<MyAnswer[]>([]);

  const reload = useCallback(() => {
    if (!me) return;
    fetchDaily().then(setDaily).catch(() => {});
    fetchAnswers().then(setAnswers).catch(() => {});
  }, [me]);

  useEffect(reload, [reload]);

  return { daily, setDaily, answers, reload };
}
