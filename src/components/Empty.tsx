import { Bookmark, UserRound } from "lucide-react";

type EmptyProps = {
  icon: "bookmark" | "user";
  title: string;
  text: string;
  action: string;
  onAction: () => void;
};

export function Empty({ icon, title, text, action, onAction }: EmptyProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon === "bookmark" ? <Bookmark size={35} /> : <UserRound size={35} />}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <button onClick={onAction}>{action}</button>
    </div>
  );
}

export function EmptySaved({ onAction }: { onAction: () => void }) {
  return (
    <Empty
      icon="bookmark"
      title="Hozircha saqlanganlar yo‘q"
      text="Qiziqarli maqolalarni saqlab, keyin o‘qishingiz mumkin."
      action="Kashf etish"
      onAction={onAction}
    />
  );
}
