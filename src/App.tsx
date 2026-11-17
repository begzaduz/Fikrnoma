import { useState } from "react";
import {
  Bookmark,
  Compass,
  Feather,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";

type Section = "home" | "shorts" | "profile";

const posts = [
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
  const [saved, setSaved] = useState<number[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [query, setQuery] = useState("");

  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const toggleLiked = (id: number) =>
    setLiked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <a className="brand" href="#" onClick={() => setSection("home")} aria-label="Fikrnoma bosh sahifa">
          <span className="brand-mark">f.</span>
          <span className="brand-name">fikrnoma</span>
        </a>
        <div className="rail-bottom">
          <button className="rail-icon" aria-label="Yangi fikr" onClick={() => setSection("profile")}><Plus size={20} /></button>
          <button className="rail-icon" aria-label="Profil" onClick={() => setSection("profile")}><UserRound size={20} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">f.</span><span className="brand-name">fikrnoma</span></div>
          <div className="topbar-note"><span className="live-dot" /> Fikrlar uchun makon</div>
          <button className="icon-button search-trigger" aria-label="Qidirish"><Search size={19} /></button>
        </header>

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
                {posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()) || post.excerpt.toLowerCase().includes(query.toLowerCase())).map((post, index) => (
                  <article className="post-card" key={post.id}>
                    <div className="post-index">0{index + 1}</div>
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
                {posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()) || post.excerpt.toLowerCase().includes(query.toLowerCase())).length === 0 && <p className="empty-state">Bu so‘rov bo‘yicha fikr topilmadi.</p>}
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
            <div className="profile-stats"><div><strong>{saved.length}</strong><span>Saqlangan</span></div><div><strong>{liked.length}</strong><span>Yoqtirilgan</span></div></div>
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
    </div>
  );
}

export default App;