import { X } from 'lucide-react';
import { Ball } from './Ball';
import { sfx } from '../game/audio';
import { text } from '../game/i18n';
import type { Language } from '../game/storage';

export function HelpModal({ language, onClose }: { language: Language; onClose: () => void }) {
  const t = text(language);
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-900/60 p-5 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[330px] animate-[winPop_.35s_cubic-bezier(.34,1.56,.64,1)] rounded-3xl border-4 border-white bg-gradient-to-b from-sky-50 via-lime-50 to-emerald-100 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-black text-emerald-950">{t.how}</h3>
          <button onClick={() => { sfx.click(); onClose(); }} className="grid h-8 w-8 place-items-center rounded-xl bg-slate-200 text-slate-600">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl bg-white/70 p-3">
          <div className="flex flex-col items-center gap-1">
            <Ball color={0} size={30} />
            <Ball color={4} size={30} />
          </div>
          <span className="font-display text-2xl font-black text-emerald-600">→</span>
          <div className="flex flex-col items-center gap-1">
            <Ball color={0} size={30} />
            <Ball color={0} size={30} />
          </div>
          <p className="text-[12px] font-bold text-slate-600">{t.helpIntro}</p>
        </div>

        <ul className="mt-3 space-y-2.5 text-[13px] font-semibold leading-snug text-slate-700">
          <li className="flex gap-2 rounded-xl bg-white/60 p-2"><span>01</span><span>{t.help1}</span></li>
          <li className="flex gap-2 rounded-xl bg-white/60 p-2"><span>02</span><span>{t.help2}</span></li>
          <li className="flex gap-2 rounded-xl bg-white/60 p-2"><span>03</span><span>{t.help3}</span></li>
          <li className="flex gap-2 rounded-xl bg-white/60 p-2"><span>04</span><span>{t.help4}</span></li>
        </ul>

        <button onClick={() => { sfx.click(); onClose(); }} className="font-display mt-4 w-full rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-b from-lime-400 to-emerald-500 py-2.5 text-lg font-black text-white active:translate-y-0.5 active:border-b-2">
          {t.start}
        </button>
      </div>
    </div>
  );
}
