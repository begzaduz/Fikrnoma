import { useState, type FormEvent } from "react";
import {
  Bookmark,
  Compass,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
  Video,
  X,
} from "lucide-react";

type Section = "home" | "shorts" | "profile";
type Post = {
  id: number;
  category: string;
  time: string;
  title: string;
  excerpt: string;
  author: string;
  initials: string;
  read: string;
  likes: number;
  comments: number;
};

const initialPosts: Post[] = [
  {
    id: 1,
    category: "TAFAKKUR",
    time: "5 daqiqa",
    title: "Biz ko‘proq ma’lumotga egamiz. Ammo ko‘proq tushunyapmizmi?",
    excerpt:
      "Axborot ko‘paygani sari fikrlashga ehtiyoj kamaymaydi. Aksincha, eng muhim ko‘nikma — keraksiz shovqin ichidan ma’noni ajrata olish.",
    author: "Muhammadali Karimov",
    initials: "MK",
    read: "4 daqiqa o‘qish",
    likes: 128,
    comments: 18,
  },
  {
    id: 2,
    category: "JAMIYAT",
    time: "Kecha",
    title: "Shaharlar odamlar uchun quriladimi yoki avtomobillar uchun?",
    excerpt:
      "Ko‘chalarimiz qanday ko‘rinishda bo‘lishi kerakligi — bu shunchaki arxitektura masalasi emas. Bu qanday hayot kechirishni tanlashimiz haqida.",
    author: "Aziza Rahimova",
    initials: "AR",
    read: "6 daqiqa o‘qish",
    likes: 94,
    comments: 12,
  },
];

function App() {
  const [section, setSection] = useState<Section>("home");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [saved, setSaved] = useState<number[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftCategory, setDraftCategory] = useState("TAFAKKUR");

  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const toggleLiked = (id: number) =>
    setLiked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const publishThought = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draftTitle.trim();
    const body = draftBody.trim();
    if (!title || !body) return;

    const newPost: Post = {
      id: Date.now(),
      category: draftCategory,
      time: "Hozirgina",
      title,
      excerpt: body,
      author: "Siz",
      initials: "S",
      read: `${Math.max(1, Math.ceil(body.split(/\\s+/).length / 180))} daqiqa o‘qish`,
      likes: 0,
      comments: 0,
    };

    setPosts((current) => [newPost, ...current]);
    setSection("home");
    setQuery("");
    setDraftTitle("");
    setDraftBody("");
    setComposerOpen(false);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("home"); }} aria-label="Fikrnoma bosh sahifa">
          <span className="brand-mark">f.</span>
          <span className="brand-name">fikrnoma</span>
        </a>
        <div className="rail-bottom">
          <button className="rail-icon" aria-label="Yangi fikr yozish" onClick={() => setComposerOpen(true)}><Plus size={20} /></button>
          <button className="rail-icon" aria-label="Profil" onClick={() => setSection("profile")}><UserRound size={20} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">f.</span><span className="brand-name">fikrnoma</span></div>
          <div className="topbar-note"><span className="live-dot" /> Fikrlar uchun makon</div>
          <div className="topbar-actions">
            <button className="icon-button search-trigger" aria-label="Qidirish" onClick={() => setSearchOpen((open) => !open)}><Search size={19} /></button>
            <button className="write-button" onClick={() => setComposerOpen(true)}><Plus size={16} /><span>Fikr yozish</span></button>
          </div>
        </header>

        {searchOpen && (
          <div className="mobile-search">
            <Search size={16} />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Fikrlarni izlash..." />
            <button aria-label="Qidiruvni yopish" onClick={() => { setSearchOpen(false); setQuery(""); }}><X size={16} /></button>
          </div>
        )}

        {section === "home" && (
          <div className="content-wrap">
            <section className="intro">
              <p className="eyebrow">17-NOYABR, 2026 <span>—</span> BUGUNGI TANLOV</p>
              <h1>Fikrlar dunyoni<br /><em>boshqacha</em> ko‘rsatadi.</h1>
              <p className="intro-copy">Shoshilmasdan o‘qish, chuqurroq o‘ylash va o‘z qarashingni shakllantirish uchun makon.</p>
              <div className="intro-rule"><span>01</span><span className="rule-line" /><span>MUHARRIR TANLOVI</span></div>
            </section>

            <section className="feed-section">
              <div className="section-heading">
                <div><p className="eyebrow">SARALANGAN FIKRLAR</p><h2>Bugun o‘qish uchun</h2></div>
                <button className="text-button" onClick={() => setSection("shorts")}>Barchasi <span>↗</span></button>
              </div>
              <div className="post-list">
                {filteredPosts.map((post, index) => (
                  <article className="post-card" key={post.id}>
                    <div className="post-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="post-body">
                      <div className="post-meta"><span>{post.category}</span><i />{post.time}</div>
                      <h3>{post.title}</h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <div className="post-footer">
                        <div className="author"><span className="avatar">{post.initials}</span><span>{post.author}</span><span className="meta-divider">·</span><span className="read-time">{post.read}</span></div>
                        <div className="post-actions">
                          <button className={liked.includes(post.id) ? "action active" : "action"} onClick={() => toggleLiked(post.id)} aria-label="Yoqtirish"><Heart size={17} /><span>{post.likes + (liked.includes(post.id) ? 1 : 0)}</span></button>
                          <button className="action" aria-label="Izohlar"><MessageCircle size={17} /><span>{post.comments}</span></button>
                          <button className={saved.includes(post.id) ? "action active" : "action"} onClick={() => toggleSaved(post.id)} aria-label="Saqlash"><Bookmark size={17} /></button>
                        </div>
                      </div>
                    </div>
                    <button className="more-button" aria-label="Boshqa amallar"><MoreHorizontal size={19} /></button>
                  </article>
                ))}
                {filteredPosts.length === 0 && <p className="empty-state">Bu so‘rov bo‘yicha fikr topilmadi.</p>}
              </div>
            </section>
          </div>
        )}

        {section === "shorts" && (
          <div className="content-wrap secondary-view">
            <p className="eyebrow">QISQA FORMAT</p>
            <h1>Bir fikr.<br /><em>Bir lahza.</em></h1>
            <p className="intro-copy">Shorts — murakkab fikrlarni qisqa, vizual va esda qolarli shaklda kashf etish maydoni.</p>
            <div className="coming-panel"><Video size={25} /><span>SHORTS</span><p>Bu bo‘lim keyingi bosqichda ishga tushadi.</p></div>
          </div>
        )}

        {section === "profile" && (
          <div className="content-wrap secondary-view">
            <p className="eyebrow">SHAXSIY MAKON</p>
            <h1>Fikrlaringiz<br /><em>shu yerdan</em> boshlanadi.</h1>
            <p className="intro-copy">Profil, saqlangan materiallar va o‘zingiz ulashgan fikrlar shu yerda jamlanadi.</p>
            <div className="profile-stats"><div><strong>{saved.length}</strong><span>Saqlangan</span></div><div><strong>{liked.length}</strong><span>Yoqtirilgan</span></div><div><strong>{posts.filter((post) => post.author === "Siz").length}</strong><span>Fikrlaringiz</span></div></div>
            <div className="coming-panel"><UserRound size={25} /><span>PROFIL</span><p>Hisob yaratish va shaxsiy sahifa keyingi bosqichda qo‘shiladi.</p></div>
          </div>
        )}
      </main>

      <aside className="right-column">
        <div className="right-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Fikrlarni izlash..." /></div>
        <div className="right-block">
          <p className="eyebrow">FIKRNOMA HAQIDA</p>
          <p className="about-copy">Har bir katta o‘zgarish avval bir fikrdan boshlanadi.</p>
          <span className="about-mark">f.</span>
        </div>
        <div className="right-bottom"><span>O‘YLA. ANGLA. ULASH.</span><span>© 2026 FIKRNOMA</span></div>
      </aside>

      <nav className="bottom-nav" aria-label="Asosiy navigatsiya">
        <button className={section === "home" ? "nav-item selected" : "nav-item"} onClick={() => setSection("home")} aria-label="Bosh sahifa"><Home size={21} strokeWidth={section === "home" ? 2.3 : 1.7} /></button>
        <button className={section === "shorts" ? "nav-item selected" : "nav-item"} onClick={() => setSection("shorts")} aria-label="Shorts"><Compass size={21} strokeWidth={section === "shorts" ? 2.3 : 1.7} /></button>
        <button className={section === "profile" ? "nav-item selected" : "nav-item"} onClick={() => setSection("profile")} aria-label="Profil"><UserRound size={21} strokeWidth={section === "profile" ? 2.3 : 1.7} /></button>
      </nav>

      {composerOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false); }}>
          <section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
            <div className="composer-heading">
              <div><p className="eyebrow">FIKRNOMAGA QO‘SHING</p><h2 id="composer-title">Fikringizni ulashing.</h2></div>
              <button className="close-button" aria-label="Yopish" onClick={() => setComposerOpen(false)}><X size={19} /></button>
            </div>
            <form onSubmit={publishThought}>
              <label htmlFor="thought-category">Yo‘nalish</label>
              <select id="thought-category" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>
                <option value="TAFAKKUR">Tafakkur</option>
                <option value="JAMIYAT">Jamiyat</option>
                <option value="MADANIYAT">Madaniyat</option>
                <option value="TEXNOLOGIYA">Texnologiya</option>
                <option value="HAYOT">Hayot</option>
              </select>
              <label htmlFor="thought-title">Sarlavha</label>
              <input id="thought-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Fikringizni bir jumlada ifodalang..." maxLength={120} required />
              <label htmlFor="thought-body">Fikr</label>
              <textarea id="thought-body" value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder="Fikringizni batafsil yozing..." rows={6} required />
              <div className="composer-footer"><span>Hozircha faqat ushbu ko‘rish sessiyasida saqlanadi.</span><button className="publish-button" type="submit">Ulashish <span>↗</span></button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
