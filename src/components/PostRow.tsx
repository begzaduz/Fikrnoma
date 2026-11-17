import { Bookmark } from "lucide-react";
import type { Post } from "../api";

export function PostRow({ post, onOpen }: { post: Post; onOpen: () => void }) {
  return (
    <button className="post-row" onClick={onOpen}>
      <img src={post.image} alt="" />
      <span className="post-row-copy">
        <small>{post.category}</small>
        <strong>{post.title}</strong>
        <em>◷ {post.time}</em>
      </span>
      <Bookmark size={16} className="row-bookmark" />
    </button>
  );
}
