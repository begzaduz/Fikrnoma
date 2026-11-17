import { ArrowLeft, Bell, ChevronRight, CircleHelp, Globe, Info, LogOut, Sun } from "lucide-react";

const ITEMS = [
  { name: "Bildirishnomalar", icon: Bell, desc: "Yangiliklar va eslatmalar" },
  { name: "Til", icon: Globe, desc: "O‘zbekcha" },
  { name: "Mavzuni o‘zgartirish", icon: Sun, desc: "Tizim bo‘yicha" },
  { name: "Yordam", icon: CircleHelp, desc: "Savollar va javoblar" },
  { name: "Biz bilan bog‘lanish", icon: Info, desc: "Fikr va takliflar" },
  { name: "Ilova haqida", icon: Info, desc: "Fikrnoma haqida" },
];

export function SettingsPage({ onBack }: { onBack: () => void }) {
  return (
    <section className="page-wrap subpage">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Orqaga
      </button>
      <p className="eyebrow">ILOVA</p>
      <h1>Sozlamalar</h1>
      <div className="settings-list">
        {ITEMS.map(({ name, icon: Icon, desc }) => (
          <button className="settings-row" key={name}>
            <Icon size={19} />
            <span>
              <strong>{name}</strong>
              <small>{desc}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      <button className="logout-btn">
        <LogOut size={17} /> Chiqish
      </button>
    </section>
  );
}
