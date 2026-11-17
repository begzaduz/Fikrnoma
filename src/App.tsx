import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Bookmark, ChevronRight, Compass, Heart, Home, LogOut, Plus, Search, Settings, SlidersHorizontal, UserRound, X, Bell, Globe, Sun, CircleHelp, Info, ImagePlus } from "lucide-react";
import { ApiError, createPost, fetchFeatured, fetchMe, fetchMyList, fetchPost, fetchPosts, fetchShorts, fetchStats, login, setReaction, uploadImage, type Me, type Post, type Short, type Stats } from "./api";

type Section = "home" | "shorts" | "profile";
type Page = "main" | "saved" | "settings";
const MONTHS=["YANVAR","FEVRAL","MART","APREL","MAY","IYUN","IYUL","AVGUST","SENTABR","OKTABR","NOYABR","DEKABR"];
const TODAY=`${new Date().getDate()} ${MONTHS[new Date().getMonth()]}`;
const categories=["Barchasi","Hayot","Psixologiya","Biznes","Falsafa","Jamiyat","Tafakkur"];
function App(){
 const [section,setSection]=useState<Section>("home");
 const [page,setPage]=useState<Page>("main");
 const [posts,setPosts]=useState<Post[]>([]);
 const [selected,setSelected]=useState<Post|null>(null);
 const [featured,setFeatured]=useState<Post|null>(null);
 const [shortItems,setShortItems]=useState<Short[]>([]);
 const [me,setMe]=useState<Me|null>(null);
 const [stats,setStats]=useState<Stats|null>(null);
 const [profileItems,setProfileItems]=useState<Post[]>([]);
 const [savedItems,setSavedItems]=useState<Post[]>([]);
 const [posting,setPosting]=useState(false);
 const [notice,setNotice]=useState("");
 const [tick,setTick]=useState(0);
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("Barchasi");
 const [composer,setComposer]=useState(false);
 const [title,setTitle]=useState("");
 const [body,setBody]=useState("");
 const [kind,setKind]=useState("TAFAKKUR");
 const [coverFile,setCoverFile]=useState<File|null>(null);
 const [coverPreview,setCoverPreview]=useState("");
 const [shortIndex,setShortIndex]=useState(0);
 const [profileTab,setProfileTab]=useState<"mine"|"saved"|"liked">("saved");
 const [,setSettingsTab]=useState("Til");
 const flash=useCallback((m:string)=>{setNotice(m);window.setTimeout(()=>setNotice(""),3200);},[]);
 useEffect(()=>{let off=false;(async()=>{
  await login();
  const [list,feat,shorts,cur]=await Promise.allSettled([fetchPosts(),fetchFeatured(),fetchShorts(),fetchMe()]);
  if(off)return;
  if(list.status==="fulfilled")setPosts(list.value);else flash("Fikrlarni yuklab bo‘lmadi. Internetni tekshiring.");
  if(feat.status==="fulfilled")setFeatured(feat.value);
  if(shorts.status==="fulfilled")setShortItems(shorts.value);
  if(cur.status==="fulfilled")setMe(cur.value);
 })();return()=>{off=true};},[flash]);
 useEffect(()=>{if(section!=="profile"||page!=="main"||!me)return;let off=false;
  Promise.all([fetchStats(),fetchMyList(profileTab==="mine"?"posts":profileTab)]).then(([st,items])=>{if(!off){setStats(st);setProfileItems(items);}}).catch(()=>{});
  return()=>{off=true};},[section,page,profileTab,me,tick]);
 useEffect(()=>{if(page!=="saved"||!me)return;let off=false;
  fetchMyList("saved").then(items=>{if(!off)setSavedItems(items);}).catch(()=>{});
  return()=>{off=true};},[page,me,tick]);
 const patchPost=(id:number,patch:Partial<Post>)=>{
  setPosts(v=>v.map(p=>p.id===id?{...p,...patch}:p));
  setSelected(v=>v&&v.id===id?{...v,...patch}:v);
  setFeatured(v=>v&&v.id===id?{...v,...patch}:v);
 };
 const react=async(p:Post,kind:"like"|"save")=>{
  if(!me){flash("Davom etish uchun Telegram orqali kiring.");return;}
  const on=kind==="like"?!p.liked:!p.saved;
  patchPost(p.id,kind==="like"?{liked:on,likes:p.likes+(on?1:-1)}:{saved:on});
  try{const r=await setReaction(p.id,kind,on);if(typeof r.likes==="number")patchPost(p.id,{likes:r.likes});setTick(t=>t+1);}
  catch{patchPost(p.id,kind==="like"?{liked:p.liked,likes:p.likes}:{saved:p.saved});flash("Amal bajarilmadi. Qayta urinib ko‘ring.");}
 };
 const filtered=useMemo(()=>posts.filter(p=>(category==="Barchasi"||p.category.toLowerCase()===category.toLowerCase())&&(!query||(p.title+" "+p.excerpt).toLowerCase().includes(query.toLowerCase()))),[posts,category,query]);
 const publish=async(e:FormEvent)=>{e.preventDefault();if(!title.trim()||!body.trim()||posting)return;
  if(!me){flash("Fikr yozish uchun Telegram orqali kiring.");return;}
  setPosting(true);
  try{const imageUrl=coverFile?await uploadImage(coverFile):undefined;const p=await createPost({category:kind,title:title.trim(),content:body.trim(),...(imageUrl?{imageUrl}:{})});setPosts(v=>[p,...v]);setTitle("");setBody("");setCoverFile(null);setCoverPreview("");setComposer(false);setSection("home");setPage("main");setTick(t=>t+1);}
  catch(err){flash(err instanceof ApiError?err.message:"Yuborib bo‘lmadi. Qayta urinib ko‘ring.");}
  finally{setPosting(false);}
 };
 const openPost=(p:Post)=>{setSelected(p);setPage("main");fetchPost(p.id).then(full=>setSelected(v=>v&&v.id===full.id?full:v)).catch(()=>{});};
 const go=(s:Section)=>{setSection(s);setSelected(null);setPage("main");};
 return <div className="app-shell">
  <header className="topbar">
   <button className="wordmark" onClick={()=>{go("home");setPage("main");}}>fikrnoma<span>.</span></button>
   <div className="top-actions"><button className="icon-btn" aria-label="Qidirish" onClick={()=>document.getElementById("main-search")?.focus()}><Search size={19}/></button><button className="icon-btn desktop-write" aria-label="Yangi fikr" onClick={()=>setComposer(true)}><Plus size={19}/></button></div>
  </header>
  <main className="main-area">
   {page==="saved" ? <section className="page-wrap subpage"><button className="back-link" onClick={()=>setPage("main")}><ArrowLeft size={17}/> Orqaga</button><p className="eyebrow">SHAXSIY TO‘PLAM</p><h1>Saqlanganlar</h1><div className="segmented"><button className="active">Maqolalar</button><button onClick={()=>setProfileTab("saved")}>To‘plamlar</button></div>{savedItems.length?savedItems.map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>):<Empty icon="bookmark" title="Hozircha saqlanganlar yo‘q" text="Qiziqarli maqolalarni saqlab, keyin o‘qishingiz mumkin." action="Kashf etish" onAction={()=>go("shorts")}/>}</section>
   :page==="settings"?<section className="page-wrap subpage"><button className="back-link" onClick={()=>setPage("main")}><ArrowLeft size={17}/> Orqaga</button><p className="eyebrow">ILOVA</p><h1>Sozlamalar</h1><div className="settings-list">{[{name:"Bildirishnomalar",icon:Bell,desc:"Yangiliklar va eslatmalar"},{name:"Til",icon:Globe,desc:"O‘zbekcha"},{name:"Mavzuni o‘zgartirish",icon:Sun,desc:"Tizim bo‘yicha"},{name:"Yordam",icon:CircleHelp,desc:"Savollar va javoblar"},{name:"Biz bilan bog‘lanish",icon:Info,desc:"Fikr va takliflar"},{name:"Ilova haqida",icon:Info,desc:"Fikrnoma haqida"}].map(item=><button className="settings-row" key={item.name} onClick={()=>setSettingsTab(item.name)}><item.icon size={19}/><span><strong>{item.name}</strong><small>{item.desc}</small></span><ChevronRight size={17}/></button>)}</div><button className="logout-btn"><LogOut size={17}/> Chiqish</button></section>
   :selected?<article className="article-view"><button className="back-link" onClick={()=>setSelected(null)}><ArrowLeft size={17}/> Orqaga</button><img className="article-cover" src={selected.image} alt="Maqola muqovasi"/><div className="article-body"><span className="category-pill">{selected.category}</span><h1>{selected.title}</h1><div className="byline"><span className="avatar">{selected.initials}</span><span><b>{selected.author}</b><small>{selected.time}</small></span></div><div className="article-copy">{selected.content.split(/\n\n+/).map((para,i)=><p key={i}>{para}</p>)}</div><div className="article-actions"><button className={selected.liked?"active":""} onClick={()=>react(selected,"like")}><Heart size={19}/> {selected.likes}</button><button className={selected.saved?"active":""} onClick={()=>react(selected,"save")}><Bookmark size={19}/> {selected.saved?"Saqlandi":"Saqlash"}</button></div></div></article>
   :section==="home"?<div className="page-wrap home-page">
    <section className="featured">
     <div className="featured-heading"><p className="eyebrow">BUGUNGI TANLOV</p><span className="date-label">{TODAY}</span></div>
     {featured&&<button className="featured-card" onClick={()=>openPost(featured)}><img src={featured.image} alt=""/><span className="image-shade"/><span className="category-pill light">{featured.category}</span><span className="featured-copy"><strong>{featured.title}</strong><small>◷ {featured.time}</small></span></button>}
     <div className="carousel-dots"><i className="active"/><i/><i/></div>
    </section>
    <section className="today-section"><div className="section-title"><h2>Bugungi fikrlar</h2><button onClick={()=>go("shorts")}>Barchasini ko‘rish <ChevronRight size={15}/></button></div><div className="thought-list">{posts.filter(p=>p.id!==featured?.id).map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}</div></section>
    <section className="quote-banner"><span>F.</span><p>Har bir yangi fikr — dunyoga boshqa nigoh.</p></section>
   </div>
   :section==="shorts"?<div className="page-wrap discover-page"><div className="discover-head"><h1>Kashf etish</h1><button className="filter-btn" aria-label="Filtr"><SlidersHorizontal size={18}/></button></div><label className="search-field"><Search size={16}/><input id="main-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Mavzu yoki muallif..."/></label><div className="category-scroll">{categories.map(c=><button key={c} className={category===c?"chosen":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="discover-list">{filtered.map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}{filtered.length===0&&<p className="no-results">Bu mavzuda hozircha fikr topilmadi.</p>}</div>{shortItems.length>0&&<div className="shorts-feature"><div className="shorts-feature-top"><span>FIKRNI QISQA HIS ETING</span><span>{shortIndex+1} / {shortItems.length}</span></div><p>“{shortItems[shortIndex].quote}”</p><div className="shorts-feature-bottom"><span>{shortItems[shortIndex].category}</span><div><button onClick={()=>setShortIndex(i=>(i+shortItems.length-1)%shortItems.length)}><ArrowLeft size={16}/></button><button onClick={()=>setShortIndex(i=>(i+1)%shortItems.length)}><ChevronRight size={16}/></button></div></div></div>}</div>
   :<div className="page-wrap profile-page"><div className="profile-top"><div className="profile-avatar">{me?.initials??"?"}</div><div className="profile-info"><h1>{me?.name??"Mehmon"}</h1><p>{me?.username?"@"+me.username:"Telegram orqali kiring"}</p></div><button className="settings-trigger" onClick={()=>setPage("settings")} aria-label="Sozlamalar"><Settings size={20}/></button></div><div className="profile-stats"><div><b>{stats?.posts??0}</b><span>Fikrlar</span></div><div><b>{stats?.liked??0}</b><span>Sevimlilar</span></div><div><b>{stats?.followers??0}</b><span>Obunachilar</span></div></div><button className="reading-streak"><span>▥</span><span><b>O‘qish odatingiz</b><small>Bu oyda {stats?.readsThisMonth??0} maqola</small></span><ChevronRight size={17}/></button><div className="section-title profile-section-title"><h2>{profileTab==="saved"?"Mening saqlanganlarim":profileTab==="liked"?"Yoqtirganlarim":"Mening fikrlarim"}</h2><button onClick={()=>setPage("saved")}>Barchasini ko‘rish <ChevronRight size={15}/></button></div><div className="profile-tabs"><button className={profileTab==="saved"?"active":""} onClick={()=>setProfileTab("saved")}>Saqlanganlar</button><button className={profileTab==="liked"?"active":""} onClick={()=>setProfileTab("liked")}>Yoqtirganlar</button><button className={profileTab==="mine"?"active":""} onClick={()=>setProfileTab("mine")}>Fikrlarim</button></div><div className="thought-list">{profileItems.slice(0,3).map(p=><PostRow key={p.id} post={p} onOpen={()=>openPost(p)}/>)}{profileItems.length===0&&<Empty icon="bookmark" title="Hozircha saqlanganlar yo‘q" text="Qiziqarli maqolalarni saqlab, keyin o‘qishingiz mumkin." action="Kashf etish" onAction={()=>go("shorts")}/>}</div><button className="settings-link" onClick={()=>setPage("settings")}><Settings size={17}/> Sozlamalar <ChevronRight size={17}/></button></div>}
  </main>
  <nav className="bottom-nav"><button className={section==="home"&&page==="main"?"active":""} onClick={()=>go("home")}><Home size={20}/><span>Bosh sahifa</span></button><button className={section==="shorts"&&page==="main"?"active":""} onClick={()=>go("shorts")}><Compass size={20}/><span>Kashf etish</span></button><button className={section==="profile"&&page==="main"?"active":""} onClick={()=>go("profile")}><UserRound size={20}/><span>Profil</span></button></nav>
  <button className="floating-write" onClick={()=>setComposer(true)} aria-label="Fikr yozish"><Plus size={22}/></button>
  {composer&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setComposer(false)}}><form className="composer-modal" onSubmit={publish}><div className="modal-head"><div><p className="eyebrow">FIKRNOMAGA QO‘SHING</p><h2>Fikringizni ulashing.</h2></div><button type="button" onClick={()=>{setComposer(false);setCoverFile(null);setCoverPreview("");}}><X size={19}/></button></div><label>Yo‘nalish</label><select value={kind} onChange={e=>setKind(e.target.value)}><option>TAFAKKUR</option><option>HAYOT</option><option>JAMIYAT</option><option>FALSAFA</option><option>PSIXOLOGIYA</option><option>BIZNES</option></select><label>Sarlavha</label><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Fikringizni bir jumlada ifodalang..." required/><label>Fikr</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} placeholder="Fikringizni batafsil yozing..." required/><label className="cover-upload"><ImagePlus size={18}/><span>{coverFile?coverFile.name:"Muqova rasmini qo‘shish"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){flash("Rasm hajmi 5 MB dan oshmasligi kerak.");e.currentTarget.value="";return;}setCoverFile(file);const reader=new FileReader();reader.onload=()=>setCoverPreview(String(reader.result??""));reader.readAsDataURL(file);}}/></label>{coverPreview&&<img className="cover-preview" src={coverPreview} alt="Muqova ko‘rinishi"/>}<button className="publish-btn" type="submit" disabled={posting}>{posting?"Yuborilmoqda…":"Ulashish"} <ChevronRight size={17}/></button><small className="session-note">Fikringiz Fikrnoma’da e’lon qilinadi.</small></form></div>}
  {notice&&<div className="toast" role="status">{notice}</div>}
 </div>;
}
function PostRow({post,onOpen}:{post:Post;onOpen:()=>void}){return <button className="post-row" onClick={onOpen}><img src={post.image} alt=""/><span className="post-row-copy"><small>{post.category}</small><strong>{post.title}</strong><em>◷ {post.time}</em></span><Bookmark size={16} className="row-bookmark"/></button>}
function Empty({icon,title,text,action,onAction}:{icon:string;title:string;text:string;action:string;onAction:()=>void}){return <div className="empty-state"><div className="empty-icon">{icon==="bookmark"?<Bookmark size={35}/>:<UserRound size={35}/>}</div><h3>{title}</h3><p>{text}</p><button onClick={onAction}>{action}</button></div>}
export default App;
