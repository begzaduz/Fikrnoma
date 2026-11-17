import { useEffect, useState } from "react";
import { fetchFeatured, fetchMe, fetchPosts, fetchShorts, login, type Me, type Post, type Short } from "../api";

/** Ilova ochilganda: kirish va bosh sahifa ma’lumotlarini yuklash. */
export function useBootstrap(flash: (message: string) => void) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [featured, setFeatured] = useState<Post | null>(null);
  const [shortItems, setShortItems] = useState<Short[]>([]);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await login();
      const [list, feat, shorts, cur] = await Promise.allSettled([fetchPosts(), fetchFeatured(), fetchShorts(), fetchMe()]);
      if (cancelled) return;
      if (list.status === "fulfilled") setPosts(list.value);
      else flash("Fikrlarni yuklab bo‘lmadi. Internetni tekshiring.");
      if (feat.status === "fulfilled") setFeatured(feat.value);
      if (shorts.status === "fulfilled") setShortItems(shorts.value);
      if (cur.status === "fulfilled") setMe(cur.value);
    })();
    return () => {
      cancelled = true;
    };
  }, [flash]);

  return { posts, setPosts, featured, setFeatured, shortItems, me };
}
