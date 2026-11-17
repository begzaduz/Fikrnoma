import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Bookmark, ChevronRight, Compass, Heart, Home, LogOut, Plus, Search, Settings, SlidersHorizontal, UserRound, X, Bell, Globe, Sun, CircleHelp, Info } from "lucide-react";

type Section = "home" | "shorts" | "profile";
type Page = "main" | "saved" | "settings";
type Post = { id:number; category:string; time:string; title:string; excerpt:string; content:string; author:string; initials:string; read:string; likes:number; comments:number; image:string; };
const photos = {
  city:"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
  thinker:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  coffee:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
  books:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
  plant:"https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85",
  portrait:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  minimal:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
};
const initialPosts:Post[] = [
 {id:1,category:"TAFAKKUR",time:"3 daqiqa o‘qish",title:"Ba’zan to‘g‘ri savol — javobdan muhimroq.",excerpt:"Biz javoblarni izlashga shoshilamiz. Ammo ayrim savollar bizni butunlay boshqa tomonga boshlaydi.",content:"Biz javoblarni izlashga shoshilamiz. Chunki javob aniq, o‘lchash mumkin va ko‘pincha xotirjamlik beradi. Savol esa aksincha — fikrimizni bezovta qiladi.\n\nLekin rivojlanish ko‘pincha tayyor javobdan emas, to‘g‘ri qo‘yilgan savoldan boshlanadi. Savol biz ko‘rmayotgan jihatni ochadi, odatiy qarashlarimizni qayta ko‘rib chiqishga undaydi.\n\nBalki ba’zan javob topishdan oldin, nimani so‘rayotganimizni aniqlab olishimiz kerakdir.",author:"Fikrnoma",initials:"F",read:"3 daqiqa o‘qish",likes:128,comments:18,image:photos.city},
 {id:2,category:"HAYOT",time:"2 daqiqa o‘qish",title:"Kamroq shovqin — ko‘proq mazmun.",excerpt:"Har bir bo‘shliqni nimadir bilan to‘ldirish shart emas. Ba’zan sukut ham fikrni tartibga soladi.",content:"Har kuni bizga minglab xabarlar, fikrlar va tasvirlar yetib keladi. Ularning barchasiga munosabat bildirishga urinish esa ichki ovozimizni eshitishni qiyinlashtiradi.\n\nSukut — hech narsa bo‘lmayotgan vaqt emas. U fikrlar joyiga tushadigan, muhim va ikkinchi darajali narsalar ajraladigan makon bo‘lishi mumkin.",author:"Aziza Rahimova",initials:"AR",read:"2 daqiqa o‘qish",likes:86,comments:9,image:photos.thinker},
 {id:3,category:"FALSAFA",time:"4 daqiqa o‘qish",title:"Baxt — bu orzu emas, holatdir.",excerpt:"Baxtni uzoqdagi marraga aylantirsak, bugungi kunimizni sezmay qolishimiz mumkin.",content:"Baxt ko‘pincha katta maqsadlar bilan bog‘lanadi. Go‘yoki biror narsaga erishsak, keyin hammasi yaxshi bo‘ladigandek. Ammo hayot faqat marralardan iborat emas.\n\nBaxt ba’zan oddiy lahzada, yaqin inson bilan suhbatda yoki o‘zimizni anglashda namoyon bo‘ladi.",author:"Fikrnoma",initials:"F",read:"4 daqiqa o‘qish",likes:73,comments:6,image:photos.coffee},
 {id:4,category:"JAMIYAT",time:"5 daqiqa o‘qish",title:"Kelajak haqida kim o‘ylayapti?",excerpt:"Bugungi qarorlar ertangi muhitni yaratadi. Kelajak esa uzoqdagi mavhum tushuncha emas.",content:"Kelajak o‘z-o‘zidan paydo bo‘lmaydi. U bugun qilayotgan tanlovlarimiz, qurayotgan tizimlarimiz va e’tibor berayotgan qadriyatlarimizdan shakllanadi.",author:"Bekzod M.",initials:"BM",read:"5 daqiqa o‘qish",likes:51,comments:4,image:photos.minimal},
];
const shortItems = [
 {category:"TAFAKKUR",quote:"Ko‘p narsani bilish — dono bo‘lish degani emas. Muhimi, bilganing haqida qanday fikrlashing.",tone:"sand"},
 {category:"JAMIYAT",quote:"Shahar — xaritadagi ko‘chalar emas. U odamlar bir-biriga qanchalik yaqin yashashidir.",tone:"olive"},
 {category:"HAYOT",quote:"Ba’zan oldinga yurish uchun tezlashish emas, nimaga shoshilayotganingni anglash kerak.",tone:"ink"},
];
const categories=["Barchasi","Hayot","Psixologiya","Biznes","Falsafa","Jamiyat","Tafakkur"];
function App(){
 const [section,setSection]=useState<Section>("home");
 const [page,setPage]=useState<Page>("main");
 const [posts,setPosts]=useState<Post[]>(initialPosts);
 const [selected,setSelected]=useState<Post|null>(null);
 const [saved,setSaved]=useState<number[]>([]);
 const [liked,setLiked]=useState<number[]>([]);
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("Barchasi");
 const [composer,setComposer]=useState(false);
 const [title,setTitle]=useState("");
 const [body,setBody]=useState("");
 const [kind,setKind]=useState("TAFAKKUR");
 const [shortIndex,setShortIndex]=useState(0);
 const [profileTab,setProfileTab]=useState<"mine"|"saved"|"liked">("saved");
 const [,setSettingsTab]=useState("Til");
 const toggle=(id:number,list:number[],setter:(v:number[])=>void)=>setter(list.includes(id)?list.filter(x=>x!==id):[...list,id]);
 const filtered=useMemo(()=>posts.filter(p=>(category==="Barchasi"||p.category.toLowerCase()===category.toLowerCase())&&(!query||(p.title+" "+p.excerpt).toLowerCase().includes(query.toLowerCase()))),[posts,category,query]);
 const publish=(e:FormEvent)=>{e.preventDefault();if(!title.trim()||!body.trim())return;const p:Post={id:Date.now(),category:kind,time:"Hozirgina",title:title.trim(),excerpt:body.trim().slice(0,150),content:body.trim(),author:"Siz",initials:"S",read:"1 daqiqa o‘qish",likes:0,comments:0,image:photos.books};setPosts(v=>[p,...v]);setTitle("");setBody("");setComposer(false);setSection("home");setPage("main");};
 const openPost=(p:Post)=>{setSelected(p);setPage("main");};
 const go=(s:Section)=>{setSection(s);setSelected(null);setPage("main");};
 const savedPosts=posts.filter(p=>saved.includes(p.id));
 const likedPosts=posts.filter(p=>liked.includes(p.id));
 const mine=posts.filter(p=>p.author==="Siz");
 return <div className="app-shell">
  <header className="topbar">
   <button className="wordmark" onClick={()=>{go("home");setPage("main");}}>fikrnoma<span>.</span></button>
   <div className="top-actions"><button className="icon-btn" aria-label="Qidirish" onClick={()=>document.getElementById("main-search")?.focus()}><Search size={19}/></button><button className="icon-btn desktop-write" aria-label="Yangi fikr" onClick={()=>setComposer(true)}><Plus size={19}/></button></div>
  </header>
  <main className="main-area">
   {page==="saved" ? <section className="page-wrap subpage"><button className="back-link" onClick={()=>setPage("main")}><ArrowLeft size={17}/> Orqaga</button><p className="eyebrow">SHAXSIY TO‘PLAM</p><h1>Saqlanganlar</h1><div className="segmented"><button className="active">Maqolalar</button><button onClick={()=>setProfileTab("saved")}>To‘plamlar</button></div>{savedPosts.length?savedPosts.map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>):<Empty icon="bookmark" title="Hozcha saqlanganlar yo‘q" text="Qiziqarli maqolalarni saqlab, keyin o‘qishingiz mumkin." action="Kashf etish" onAction={()=>go("shorts")}/>}</section>
   :page==="settings"?<section className="page-wrap subpage"><button className="back-link" onClick={()=>setPage("main")}><ArrowLeft size={17}/> Orqaga</button><p className="eyebrow">ILOVA</p><h1>Sozlamalar</h1><div className="settings-list">{[{name:"Bildirishnomalar",icon:Bell,desc:"Yangiliklar va eslatmalar"},{name:"Til",icon:Globe,desc:"O‘zbekcha"},{name:"Mavzuni o‘zgartirish",icon:Sun,desc:"Tizim bo‘yicha"},{name:"Yordam",icon:CircleHelp,desc:"Savollar va javoblar"},{name:"Biz bilan bog‘lanish",icon:Info,desc:"Fikr va takliflar"},{name:"Ilova haqida",icon:Info,desc:"Fikrnoma haqida"}].map(item=><button className="settings-row" key={item.name} onClick={()=>setSettingsTab(item.name)}><item.icon size={19}/><span><strong>{item.name}</strong><small>{item.desc}</small></span><ChevronRight size={17}/></button>)}</div><button className="logout-btn"><LogOut size={17}/> Chiqish</button></section>
   :selected?<article className="article-view"><button className="back-link" onClick={()=>setSelected(null)}><ArrowLeft size={17}/> Orqaga</button><img className="article-cover" src={selected.image} alt="Maqola muqovasi"/><div className="article-body"><span className="category-pill">{selected.category}</span><h1>{selected.title}</h1><div className="byline"><span className="avatar">{selected.initials}</span><span><b>{selected.author}</b><small>{selected.time}</small></span></div><div className="article-copy">{selected.content.split(/\n\n+/).map((para,i)=><p key={i}>{para}</p>)}</div><div className="article-actions"><button className={liked.includes(selected.id)?"active":""} onClick={()=>toggle(selected.id,liked,setLiked)}><Heart size={19}/> {selected.likes+(liked.includes(selected.id)?1:0)}</button><button className={saved.includes(selected.id)?"active":""} onClick={()=>toggle(selected.id,saved,setSaved)}><Bookmark size={19}/> {saved.includes(selected.id)?"Saqlandi":"Saqlash"}</button></div></div></article>
   :section==="home"?<div className="page-wrap home-page">
    <section className="featured">
     <div className="featured-heading"><p className="eyebrow">BUGUNGI TANLOV</p><span className="date-label">17 NOYABR</span></div>
     <button className="featured-card" onClick={()=>openPost(posts[0])}><img src={photos.city} alt="Shahar manzarasi"/><span className="image-shade"/><span className="category-pill light">TAFAKKUR</span><span className="featured-copy"><strong>Ba’zan to‘g‘ri<br/>savol — javobdan<br/>muhimroq.</strong><small>◷ 3 daqiqa o‘qish</small></span></button>
     <div className="carousel-dots"><i className="active"/><i/><i/></div>
    </section>
    <section className="today-section"><div className="section-title"><h2>Bugungi fikrlar</h2><button onClick={()=>go("shorts")}>Barchasini ko‘rish <ChevronRight size={15}/></button></div><div className="thought-list">{posts.slice(1).map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}</div></section>
    <section className="quote-banner"><span>F.</span><p>Har bir yangi fikr — dunyoga boshqa nigoh.</p></section>
   </div>
   :section==="shorts"?<div className="page-wrap discover-page"><div className="discover-head"><h1>Kashf etish</h1><button className="filter-btn" aria-label="Filtr"><SlidersHorizontal size={18}/></button></div><label className="search-field"><Search size={16}/><input id="main-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Mavzu yoki muallif..."/></label><div className="category-scroll">{categories.map(c=><button key={c} className={category===c?"chosen":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="discover-list">{filtered.map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}{filtered.length===0&&<p className="no-results">Bu mavzuda hozircha fikr topilmadi.</p>}</div><div className="shorts-feature"><div className="shorts-feature-top"><span>FIKRNI QISQA HIS ETING</span><span>{shortIndex+1} / {shortItems.length}</span></div><p>“{shortItems[shortIndex].quote}”</p><div className="shorts-feature-bottom"><span>{shortItems[shortIndex].category}</span><div><button onClick={()=>setShortIndex(i=>(i+shortItems.length-1)%shortItems.length)}><ArrowLeft size={16}/></button><button onClick={()=>setShortIndex(i=>(i+1)%shortItems.length)}><ChevronRight size={16}/></button></div></div></div></div>
   :<div className="page-wrap profile-page"><div className="profile-top"><div className="profile-avatar">B</div><div className="profile-info"><h1>Bekzod</h1><p>@bekzodmh</p></div><button className="settings-trigger" onClick={()=>setPage("settings")} aria-label="Sozlamalar"><Settings size={20}/></button></div><div className="profile-stats"><div><b>{mine.length}</b><span>Fikrlar</span></div><div><b>{liked.length}</b><span>Sevimlilar</span></div><div><b>1.2K</b><span>Obunachilar</span></div></div><button className="reading-streak"><span>▥</span><span><b>O‘qish odatingiz</b><small>Bu oyda 12 maqola</small></span><ChevronRight size={17}/></button><div className="section-title profile-section-title"><h2>{profileTab==="saved"?"Mening saqlanganlarim":profileTab==="liked"?"Yoqtirganlarim":"Mening fikrlarim"}</h2><button onClick={()=>setPage("saved")}>Barchasini ko‘rish <ChevronRight size={15}/></button></div><div className="profile-tabs"><button className={profileTab==="saved"?"active":""} onClick={()=>setProfileTab("saved")}>Saqlanganlar</button><button className={profileTab==="liked"?"active":""} onClick={()=>setProfileTab("liked")}>Yoqtirganlar</button><button className={profileTab==="mine"?"active":""} onClick={()=>setProfileTab("mine")}>Fikrlarim</button></div><div className="thought-list">{(profileTab==="saved"?savedPosts:profileTab==="liked"?likedPosts:mine).slice(0,3).map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}{(profileTab==="saved"?savedPosts:profileTab==="liked"?likedPosts:mine).length===0&&<Empty icon="bookmark" title="Hozcha saqlanganlar yo‘q" text="Qiziqarli maqolalarni saqlab, keyin o‘qishingiz mumkin." action="Kashf etish" onAction={()=>go("shorts")}/>}</div><button className="settings-link" onClick={()=>setPage("settings")}><Settings size={17}/> Sozlamalar <ChevronRight size={17}/></button></div>}
  </main>
  <nav className="bottom-nav"><button className={section==="home"&&page==="main"?"active":""} onClick={()=>go("home")}><Home size={20}/><span>Bosh sahifa</span></button><button className={section==="shorts"&&page==="main"?"active":""} onClick={()=>go("shorts")}><Compass size={20}/><span>Kashf etish</span></button><button className={section==="profile"&&page==="main"?"active":""} onClick={()=>go("profile")}><UserRound size={20}/><span>Profil</span></button></nav>
  <button className="floating-write" onClick={()=>setComposer(true)} aria-label="Fikr yozish"><Plus size={22}/></button>
  {composer&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setComposer(false)}}><form className="composer-modal" onSubmit={publish}><div className="modal-head"><div><p className="eyebrow">FIKRNOMAGA QO‘SHING</p><h2>Fikringizni ulashing.</h2></div><button type="button" onClick={()=>setComposer(false)}><X size={19}/></button></div><label>Yo‘nalish</label><select value={kind} onChange={e=>setKind(e.target.value)}><option>TAFAKKUR</option><option>HAYOT</option><option>JAMIYAT</option><option>FALSAFA</option><option>PSIXOLOGIYA</option></select><label>Sarlavha</label><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Fikringizni bir jumlada ifodalang..." required/><label>Fikr</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} placeholder="Fikringizni batafsil yozing..." required/><button className="publish-btn" type="submit">Ulashish <ChevronRight size={17}/></button><small className="session-note">Hozircha faqat ushbu sessiyada saqlanadi.</small></form></div>}
 </div>;
}
function PostRow({post,onOpen}:{post:Post;onOpen:()=>void}){return <button className="post-row" onClick={onOpen}><img src={post.image} alt=""/><span className="post-row-copy"><small>{post.category}</small><strong>{post.title}</strong><em>◷ {post.time}</em></span><Bookmark size={16} className="row-bookmark"/></button>}
function Empty({icon,title,text,action,onAction}:{icon:string;title:string;text:string;action:string;onAction:()=>void}){return <div className="empty-state"><div className="empty-icon">{icon==="bookmark"?<Bookmark size={35}/>:<UserRound size={35}/>}</div><h3>{title}</h3><p>{text}</p><button onClick={onAction}>{action}</button></div>}
export default App;
