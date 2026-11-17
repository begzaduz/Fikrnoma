import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import type { Post, Short } from "../api";
import { PostRow } from "../components/PostRow";
import { FILTER_CATEGORIES } from "../constants";

type DiscoverPageProps = {
  posts: Post[];
  shortItems: Short[];
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onOpen: (post: Post) => void;
};

export function DiscoverPage({ posts, shortItems, query, onQueryChange, category, onCategoryChange, onOpen }: DiscoverPageProps) {
  const [shortIndex, setShortIndex] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return posts.filter(
      (p) =>
        (category === "Barchasi" || p.category.toLowerCase() === category.toLowerCase()) &&
        (!needle || (p.title + " " + p.excerpt).toLowerCase().includes(needle)),
    );
  }, [posts, category, query]);

  const short = shortItems[shortIndex];

  return (
    <div className="page-wrap discover-page">
      <div className="discover-head">
        <h1>Kashf etish</h1>
        <button className="filter-btn" aria-label="Filtr">
          <SlidersHorizontal size={18} />
        </button>
      </div>
      <label className="search-field">
        <Search size={16} />
        <input
          id="main-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Mavzu yoki muallif..."
        />
      </label>
      <div className="category-scroll">
        {FILTER_CATEGORIES.map((c) => (
          <button key={c} className={category === c ? "chosen" : ""} onClick={() => onCategoryChange(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="discover-list">
        {filtered.map((p) => (
          <PostRow key={p.id} post={p} onOpen={() => onOpen(p)} />
        ))}
        {filtered.length === 0 && <p className="no-results">Bu mavzuda hozircha fikr topilmadi.</p>}
      </div>
      {short && (
        <div className="shorts-feature">
          <div className="shorts-feature-top">
            <span>FIKRNI QISQA HIS ETING</span>
            <span>
              {shortIndex + 1} / {shortItems.length}
            </span>
          </div>
          <p>“{short.quote}”</p>
          <div className="shorts-feature-bottom">
            <span>{short.category}</span>
            <div>
              <button onClick={() => setShortIndex((i) => (i + shortItems.length - 1) % shortItems.length)}>
                <ArrowLeft size={16} />
              </button>
              <button onClick={() => setShortIndex((i) => (i + 1) % shortItems.length)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
