import { Plus, Search } from "lucide-react";

type TopBarProps = { onHome: () => void; onSearch: () => void; onWrite?: () => void };

export function TopBar({ onHome, onSearch, onWrite }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="wordmark" onClick={onHome}>
        fikrnoma<span>.</span>
      </button>
      <div className="top-actions">
        <button className="icon-btn" aria-label="Qidirish" onClick={onSearch}>
          <Search size={19} />
        </button>
        {onWrite && (
          <button className="icon-btn desktop-write" aria-label="Yangi fikr" onClick={onWrite}>
            <Plus size={19} />
          </button>
        )}
      </div>
    </header>
  );
}
