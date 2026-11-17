import { ArrowLeft } from "lucide-react";
import type { Post } from "../api";
import { EmptySaved } from "../components/Empty";
import { PostRow } from "../components/PostRow";

type SavedPageProps = {
  items: Post[];
  onBack: () => void;
  onOpen: (post: Post) => void;
  onCollections: () => void;
  onDiscover: () => void;
};

export function SavedPage({ items, onBack, onOpen, onCollections, onDiscover }: SavedPageProps) {
  return (
    <section className="page-wrap subpage">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Orqaga
      </button>
      <p className="eyebrow">SHAXSIY TO‘PLAM</p>
      <h1>Saqlanganlar</h1>
      <div className="segmented">
        <button className="active">Maqolalar</button>
        <button onClick={onCollections}>To‘plamlar</button>
      </div>
      {items.length ? (
        items.map((p) => <PostRow key={p.id} post={p} onOpen={() => onOpen(p)} />)
      ) : (
        <EmptySaved onAction={onDiscover} />
      )}
    </section>
  );
}
