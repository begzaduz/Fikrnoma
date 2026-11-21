import { useState } from "react";
import { saveAnswer, type DailyState } from "../api";
import { haptic } from "../telegram";

type DailyCardProps = {
  daily: DailyState | null;
  signedIn: boolean;
  onChange: (next: DailyState) => void;
  flash: (message: string) => void;
};

/** Bosh sahifadagi "Bugungi 5 savol" kartasi va javob yozish oynasi. */
export function DailyCard({ daily, signedIn, onChange, flash }: DailyCardProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const next = daily?.questions.find((q) => q.answer === null) ?? null;
  const finished = !!daily && !next;

  const submit = async () => {
    if (!next || !text.trim() || busy) return;
    setBusy(true);
    try {
      const state = await saveAnswer(next.index, text.trim());
      haptic.success();
      onChange(state);
      setText("");
      if (state.done >= 5) setOpen(false);
      flash(state.done === 1 ? `${state.streak} kun ketma-ket` : "Saqlandi");
    } catch {
      haptic.error();
      flash("Saqlab bo‘lmadi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="daily-card" aria-label="Kunlik savollar">
      <small>KUNLIK FIKRLAR</small>
      <h2>Bugungi 5 savol</h2>
      <div className="daily-bars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className={daily && i < daily.done ? "on" : ""} />
        ))}
      </div>
      {!signedIn ? (
        <p className="daily-note">Savollarga javob berish uchun Telegram orqali kiring.</p>
      ) : finished ? (
        <p className="daily-note">Bugungi savollar tugadi. Ertaga yangilari bor.</p>
      ) : (
        <button className="daily-btn" onClick={() => setOpen(true)} disabled={!daily}>
          {daily?.done ? "Davom etish" : "Boshlash"} · {daily?.done ?? 0}/5
        </button>
      )}
      {open && next && (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Kunlik savol">
          <div className="sheet">
            <small>Savol {next.index + 1} / 5</small>
            <h3>{next.text}</h3>
            <textarea
              autoFocus
              aria-label="Javobingiz"
              placeholder="Fikringizni yozing..."
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="sheet-hint">Javobingiz faqat sizga ko‘rinadi.</p>
            <div className="sheet-actions">
              <button className="daily-btn" onClick={submit} disabled={busy || !text.trim()}>
                Saqlash
              </button>
              <button className="sheet-cancel" onClick={() => setOpen(false)}>
                Keyinroq
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
