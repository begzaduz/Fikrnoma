import { ChevronRight, Settings } from "lucide-react";
import type { Me, Post, Stats } from "../api";
import { EmptySaved } from "../components/Empty";
import { PostRow } from "../components/PostRow";
import type { ProfileTab } from "../types";

type ProfilePageProps = {
  me: Me | null;
  stats: Stats | null;
  items: Post[];
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onOpen: (post: Post) => void;
  onOpenSaved: () => void;
  onOpenSettings: () => void;
  onDiscover: () => void;
};

const TAB_TITLES: Record<ProfileTab, string> = {
  saved: "Mening saqlanganlarim",
  liked: "Yoqtirganlarim",
  mine: "Mening fikrlarim",
};

const TABS: Array<[ProfileTab, string]> = [
  ["saved", "Saqlanganlar"],
  ["liked", "Yoqtirganlar"],
  ["mine", "Fikrlarim"],
];

export function ProfilePage({
  me,
  stats,
  items,
  tab,
  onTabChange,
  onOpen,
  onOpenSaved,
  onOpenSettings,
  onDiscover,
}: ProfilePageProps) {
  return (
    <div className="page-wrap profile-page">
      <div className="profile-top">
        <div className="profile-avatar">{me?.initials ?? "?"}</div>
        <div className="profile-info">
          <h1>{me?.name ?? "Mehmon"}</h1>
          <p>{me?.username ? "@" + me.username : "Telegram orqali kiring"}</p>
        </div>
        <button className="settings-trigger" onClick={onOpenSettings} aria-label="Sozlamalar">
          <Settings size={20} />
        </button>
      </div>
      <div className="profile-stats">
        <div>
          <b>{stats?.posts ?? 0}</b>
          <span>Fikrlar</span>
        </div>
        <div>
          <b>{stats?.liked ?? 0}</b>
          <span>Sevimlilar</span>
        </div>
        <div>
          <b>{stats?.followers ?? 0}</b>
          <span>Obunachilar</span>
        </div>
      </div>
      <button className="reading-streak">
        <span>▥</span>
        <span>
          <b>O‘qish odatingiz</b>
          <small>Bu oyda {stats?.readsThisMonth ?? 0} maqola</small>
        </span>
        <ChevronRight size={17} />
      </button>
      <div className="section-title profile-section-title">
        <h2>{TAB_TITLES[tab]}</h2>
        <button onClick={onOpenSaved}>
          Barchasini ko‘rish <ChevronRight size={15} />
        </button>
      </div>
      <div className="profile-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => onTabChange(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="thought-list">
        {items.slice(0, 3).map((p) => (
          <PostRow key={p.id} post={p} onOpen={() => onOpen(p)} />
        ))}
        {items.length === 0 && <EmptySaved onAction={onDiscover} />}
      </div>
      <button className="settings-link" onClick={onOpenSettings}>
        <Settings size={17} /> Sozlamalar <ChevronRight size={17} />
      </button>
    </div>
  );
}
