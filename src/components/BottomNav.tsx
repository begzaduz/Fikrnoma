import { Compass, Home, UserRound } from "lucide-react";
import type { Page, Section } from "../types";

type BottomNavProps = { section: Section; page: Page; go: (section: Section) => void };

const ITEMS = [
  { id: "home", label: "Bosh sahifa", Icon: Home },
  { id: "shorts", label: "Kashf etish", Icon: Compass },
  { id: "profile", label: "Profil", Icon: UserRound },
] as const;

export function BottomNav({ section, page, go }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ id, label, Icon }) => (
        <button key={id} className={section === id && page === "main" ? "active" : ""} onClick={() => go(id)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
