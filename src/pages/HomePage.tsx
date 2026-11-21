import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { Post } from "../api";
import { PostRow } from "../components/PostRow";
import { TODAY } from "../constants";

type HomePageProps = {
  featured: Post | null;
  posts: Post[];
  onOpen: (post: Post) => void;
  onSeeAll: () => void;
  dailyCard?: ReactNode;
};

export function HomePage({ featured, posts, onOpen, onSeeAll, dailyCard }: HomePageProps) {
  return (
    <div className="page-wrap home-page">
      {dailyCard}
      <section className="featured">
        <div className="featured-heading">
          <p className="eyebrow">BUGUNGI TANLOV</p>
          <span className="date-label">{TODAY}</span>
        </div>
        {featured && (
          <button className="featured-card" onClick={() => onOpen(featured)}>
            <img src={featured.image} alt="" />
            <span className="image-shade" />
            <span className="category-pill light">{featured.category}</span>
            <span className="featured-copy">
              <strong>{featured.title}</strong>
              <small>◷ {featured.time}</small>
            </span>
          </button>
        )}
        <div className="carousel-dots">
          <i className="active" />
          <i />
          <i />
        </div>
      </section>
      <section className="today-section">
        <div className="section-title">
          <h2>Bugungi fikrlar</h2>
          <button onClick={onSeeAll}>
            Barchasini ko‘rish <ChevronRight size={15} />
          </button>
        </div>
        <div className="thought-list">
          {posts
            .filter((p) => p.id !== featured?.id)
            .map((p) => (
              <PostRow key={p.id} post={p} onOpen={() => onOpen(p)} />
            ))}
        </div>
      </section>
      <section className="quote-banner">
        <span>F.</span>
        <p>Har bir yangi fikr — dunyoga boshqa nigoh.</p>
      </section>
    </div>
  );
}
