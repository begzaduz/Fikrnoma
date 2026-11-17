import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import type { Post } from "../api";

type ArticleViewProps = {
  post: Post;
  onBack: () => void;
  onReact: (post: Post, kind: "like" | "save") => void;
};

export function ArticleView({ post, onBack, onReact }: ArticleViewProps) {
  return (
    <article className="article-view">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Orqaga
      </button>
      <img className="article-cover" src={post.image} alt="Maqola muqovasi" />
      <div className="article-body">
        <span className="category-pill">{post.category}</span>
        <h1>{post.title}</h1>
        <div className="byline">
          <span className="avatar">{post.initials}</span>
          <span>
            <b>{post.author}</b>
            <small>{post.time}</small>
          </span>
        </div>
        <div className="article-copy">
          {post.content.split(/\n\n+/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="article-actions">
          <button className={post.liked ? "active" : ""} onClick={() => onReact(post, "like")}>
            <Heart size={19} /> {post.likes}
          </button>
          <button className={post.saved ? "active" : ""} onClick={() => onReact(post, "save")}>
            <Bookmark size={19} /> {post.saved ? "Saqlandi" : "Saqlash"}
          </button>
        </div>
      </div>
    </article>
  );
}
