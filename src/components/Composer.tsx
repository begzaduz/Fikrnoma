import { useState, type FormEvent } from "react";
import { ChevronRight, ImagePlus, X } from "lucide-react";
import { ApiError, createPost, uploadImage, type Me, type Post } from "../api";
import { COMPOSER_CATEGORIES, MAX_COVER_BYTES } from "../constants";

type ComposerProps = {
  open: boolean;
  me: Me | null;
  flash: (message: string) => void;
  onClose: () => void;
  onPublished: (post: Post) => void;
};

/** Yangi fikr yozish oynasi. Yopilganda ham matn (qoralama) saqlanib turadi. */
export function Composer({ open, me, flash, onClose, onPublished }: ComposerProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState(COMPOSER_CATEGORIES[0]!);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [posting, setPosting] = useState(false);

  if (!open) return null;

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  const pickCover = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > MAX_COVER_BYTES) {
      flash("Rasm hajmi 5 MB dan oshmasligi kerak.");
      input.value = "";
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || posting) return;
    if (!me) {
      flash("Fikr yozish uchun Telegram orqali kiring.");
      return;
    }
    setPosting(true);
    try {
      const imageUrl = coverFile ? await uploadImage(coverFile) : undefined;
      const post = await createPost({
        category: kind,
        title: title.trim(),
        content: body.trim(),
        ...(imageUrl ? { imageUrl } : {}),
      });
      setTitle("");
      setBody("");
      clearCover();
      onPublished(post);
    } catch (err) {
      flash(err instanceof ApiError ? err.message : "Yuborib bo‘lmadi. Qayta urinib ko‘ring.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="composer-modal" onSubmit={publish}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">FIKRNOMAGA QO‘SHING</p>
            <h2>Fikringizni ulashing.</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              clearCover();
            }}
          >
            <X size={19} />
          </button>
        </div>
        <label>Yo‘nalish</label>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          {COMPOSER_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label>Sarlavha</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Fikringizni bir jumlada ifodalang..."
          required
        />
        <label>Fikr</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Fikringizni batafsil yozing..."
          required
        />
        <label className="cover-upload">
          <ImagePlus size={18} />
          <span>{coverFile ? coverFile.name : "Muqova rasmini qo‘shish"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickCover(e.currentTarget)} />
        </label>
        {coverPreview && <img className="cover-preview" src={coverPreview} alt="Muqova ko‘rinishi" />}
        <button className="publish-btn" type="submit" disabled={posting}>
          {posting ? "Yuborilmoqda…" : "Ulashish"} <ChevronRight size={17} />
        </button>
        <small className="session-note">Fikringiz Fikrnoma’da e’lon qilinadi.</small>
      </form>
    </div>
  );
}
