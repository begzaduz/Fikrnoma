import { useEffect, useState } from "react";
import { fetchMyList, fetchStats, type Me, type Post, type Stats } from "../api";
import type { ProfileTab } from "../types";

/** Profil sahifasi: statistika va tanlangan tab ro‘yxati. `refreshKey` o‘zgarsa qayta yuklanadi. */
export function useProfileData(enabled: boolean, me: Me | null, tab: ProfileTab, refreshKey: number) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    if (!enabled || !me) return;
    let cancelled = false;
    Promise.all([fetchStats(), fetchMyList(tab === "mine" ? "posts" : tab)])
      .then(([nextStats, nextItems]) => {
        if (cancelled) return;
        setStats(nextStats);
        setItems(nextItems);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, me, tab, refreshKey]);

  return { stats, items };
}

/** "Saqlanganlar" sahifasi ro‘yxati. */
export function useSavedItems(enabled: boolean, me: Me | null, refreshKey: number) {
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    if (!enabled || !me) return;
    let cancelled = false;
    fetchMyList("saved")
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, me, refreshKey]);

  return items;
}
