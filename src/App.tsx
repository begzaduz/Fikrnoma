import { useState } from "react";
import { Plus } from "lucide-react";
import { fetchPost, setReaction, type Post } from "./api";
import { BottomNav } from "./components/BottomNav";
import { Composer } from "./components/Composer";
import { DailyCard } from "./components/DailyCard";
import { TopBar } from "./components/TopBar";
import { useBootstrap } from "./hooks/useBootstrap";
import { useDaily } from "./hooks/useDaily";
import { useFlash } from "./hooks/useFlash";
import { useProfileData, useSavedItems } from "./hooks/useProfileData";
import { ArticleView } from "./pages/ArticleView";
import { DiscoverPage } from "./pages/DiscoverPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { haptic, useBackButton } from "./telegram";
import type { Page, ProfileTab, Section } from "./types";

function App() {
  const [section, setSection] = useState<Section>("home");
  const [page, setPage] = useState<Page>("main");
  const [selected, setSelected] = useState<Post | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const [profileTab, setProfileTab] = useState<ProfileTab>("saved");
  const [refreshKey, setRefreshKey] = useState(0);

  const { notice, flash } = useFlash();
  const { posts, setPosts, featured, setFeatured, shortItems, me } = useBootstrap(flash);
  const { stats, items: profileItems } = useProfileData(section === "profile" && page === "main", me, profileTab, refreshKey);
  const savedItems = useSavedItems(page === "saved", me, refreshKey);
  const { daily, setDaily, answers } = useDaily(me);
  const canWrite = !!me?.canWrite;

  /** Bitta fikrni barcha joylarda (ro‘yxat, ochiq maqola, bugungi tanlov) yangilaydi. */
  const patchPost = (id: number, patch: Partial<Post>) => {
    setPosts((v) => v.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSelected((v) => (v && v.id === id ? { ...v, ...patch } : v));
    setFeatured((v) => (v && v.id === id ? { ...v, ...patch } : v));
  };

  const react = async (post: Post, kind: "like" | "save") => {
    if (!me) {
      flash("Davom etish uchun Telegram orqali kiring.");
      return;
    }
    const on = kind === "like" ? !post.liked : !post.saved;
    haptic.tap();
    patchPost(post.id, kind === "like" ? { liked: on, likes: post.likes + (on ? 1 : -1) } : { saved: on });
    try {
      const result = await setReaction(post.id, kind, on);
      if (typeof result.likes === "number") patchPost(post.id, { likes: result.likes });
      setRefreshKey((k) => k + 1);
    } catch {
      patchPost(post.id, kind === "like" ? { liked: post.liked, likes: post.likes } : { saved: post.saved });
      haptic.error();
      flash("Amal bajarilmadi. Qayta urinib ko‘ring.");
    }
  };

  const go = (next: Section) => {
    setSection(next);
    setSelected(null);
    setPage("main");
  };

  const openPost = (post: Post) => {
    setSelected(post);
    setPage("main");
    fetchPost(post.id)
      .then((full) => setSelected((v) => (v && v.id === full.id ? full : v)))
      .catch(() => {});
  };

  const onPublished = (post: Post) => {
    setPosts((v) => [post, ...v]);
    haptic.success();
    setComposerOpen(false);
    go("home");
    setRefreshKey((k) => k + 1);
  };

  const backToMain = () => setPage("main");

  const navigate = (next: Section) => {
    haptic.select();
    go(next);
  };

  // Telegram "Orqaga" tugmasi: eng ustdagi qatlamni yopadi.
  const canGoBack = composerOpen || page !== "main" || selected !== null;
  useBackButton(canGoBack, () => {
    if (composerOpen) setComposerOpen(false);
    else if (page !== "main") backToMain();
    else setSelected(null);
  });

  const content =
    page === "saved" ? (
      <SavedPage
        items={savedItems}
        onBack={backToMain}
        onOpen={openPost}
        onCollections={() => setProfileTab("saved")}
        onDiscover={() => go("shorts")}
      />
    ) : page === "settings" ? (
      <SettingsPage onBack={backToMain} />
    ) : selected ? (
      <ArticleView post={selected} onBack={() => setSelected(null)} onReact={react} />
    ) : section === "home" ? (
      <HomePage featured={featured} posts={posts} onOpen={openPost} onSeeAll={() => go("shorts")}
        dailyCard={<DailyCard daily={daily} signedIn={!!me} onChange={setDaily} flash={flash} />}
      />
    ) : section === "shorts" ? (
      <DiscoverPage
        posts={posts}
        shortItems={shortItems}
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        onOpen={openPost}
      />
    ) : (
      <ProfilePage
        me={me}
        stats={stats}
        items={profileItems}
        tab={profileTab}
        onTabChange={setProfileTab}
        onOpen={openPost}
        onOpenSaved={() => setPage("saved")}
        onOpenSettings={() => setPage("settings")}
        onDiscover={() => go("shorts")}
        daily={daily}
        answers={answers}
        canWrite={canWrite}
      />
    );

  return (
    <div className="app-shell">
      <TopBar
        onHome={() => go("home")}
        onSearch={() => document.getElementById("main-search")?.focus()}
        onWrite={canWrite ? () => setComposerOpen(true) : undefined}
      />
      <main className="main-area">{content}</main>
      <BottomNav section={section} page={page} go={navigate} />
      {canWrite && (
        <button className="floating-write" onClick={() => setComposerOpen(true)} aria-label="Fikr yozish">
          <Plus size={22} />
        </button>
      )}
      <Composer open={composerOpen} me={me} flash={flash} onClose={() => setComposerOpen(false)} onPublished={onPublished} />
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}

export default App;
