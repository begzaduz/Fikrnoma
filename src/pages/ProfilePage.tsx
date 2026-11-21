import { ChevronRight, Settings } from "lucide-react";
import type { DailyState, Me, MyAnswer, Post, Stats } from "../api";
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
  daily: DailyState | null;
  answers: MyAnswer[];
  canWrite: boolean;
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

const fmtDay = (d: string) => d.slice(8, 10) + "." + d.slice(5, 7);

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
  daily,
  answers,
  canWrite,
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
          <b>{stats?.answers ?? 0}</b>
          <span>Javoblar</span>
        </div>
        <div>
          <b>{stats?.saved ?? 0}</b>
          <span>Saqlangan</span>
        </div>
        <div>
          <b>{stats?.liked ?? 0}</b>
          <span>Yoqtirgan</span>
        </div>
      </div>
      {daily && (
        <section className="level-card" aria-label="Fikr darajasi">
          <small>Fikr darajasi</small>
          <h2>{daily.level.name}</h2>
          <div className="level-bar" aria-hidden="true">
            <i style={{ width: `${Math.min(100, Math.round(((daily.points - daily.level.lo) / (daily.level.hi - daily.level.lo)) * 100))}%` }} />
          </div>
          <span>
            {daily.points} / {daily.level.hi} · {daily.streak} kun ketma-ket
          </span>
        </section>
      )}
      {answers.length > 0 && (
        <>
          <div className="section-title profile-section-title">
            <h2>Mening javoblarim</h2>
          </div>
          <div className="answer-list">
            {answers.slice(0, 3).map((a) => (
              <article key={`${a.day}-${a.idx}`} className="answer-item">
                <small>
                  {fmtDay(a.day)} · {a.question}
                </small>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </>
      )}
      <div className="section-title profile-section-title">
        <h2>{TAB_TITLES[tab]}</h2>
        <button onClick={onOpenSaved}>
          Barchasini ko‘rish <ChevronRight size={15} />
        </button>
      </div>
      <div className="profile-tabs">
        {TABS.filter(([id]) => canWrite || id !== "mine").map(([id, label]) => (
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
