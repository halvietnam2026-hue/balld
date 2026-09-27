import { Play, LayoutGrid, CircleHelp, Star, Trophy, Settings2, Coins, GalleryVerticalEnd } from 'lucide-react';
import { islandForLevel } from '../game/islands';
import { CARDS } from '../game/cards';
import { getCollection } from '../game/storage';
import { Ball } from './Ball';
import { sfx } from '../game/audio';
import type { Language } from '../game/storage';
import { text } from '../game/i18n';

interface Props {
  currentLevel: number;
  totalStars: number;
  coins: number;
  language: Language;
  onSettings: () => void;
  onPlay: () => void;
  onLevels: () => void;
  onCards: () => void;
  onHelp: () => void;
}

export function MenuScreen({ currentLevel, totalStars, coins, language, onSettings, onPlay, onLevels, onCards, onHelp }: Props) {
  const t = text(language);
  const island = islandForLevel(currentLevel);
  const col = getCollection();
  const owned = CARDS.filter((c) => col[c.id]).length;
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* nền tranh đồng quê */}
      <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/menu-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* mây trôi trang trí */}
      <div className="pointer-events-none absolute left-[6%] top-[13%] animate-[cloudDrift_7s_ease-in-out_infinite_alternate] opacity-90">
        <div className="h-7 w-24 rounded-full bg-white/85 blur-[1px]" />
      </div>
      <div className="pointer-events-none absolute right-[8%] top-[24%] animate-[cloudDrift_9s_ease-in-out_infinite_alternate-reverse] opacity-80">
        <div className="h-5 w-16 rounded-full bg-white/80 blur-[1px]" />
      </div>

      {/* ── tiêu đề bong bóng ── */}
      <div className="relative z-10 px-4 pt-7 text-center">
        <div className="animate-[fadeUp_.6s_ease-out]">
          <h1 className="bubble-text bubble-blue text-[13.5vw] max-[400px]:text-[52px] sm:text-[56px]">ARRANGE</h1>
          <h1 className="bubble-text bubble-mint text-[11vw] max-[400px]:text-[42px] sm:text-[46px]">THE BALLS</h1>
          <h1 className="bubble-text bubble-green text-[10vw] max-[400px]:text-[38px] sm:text-[42px]">& TEST TUBE</h1>
        </div>

        {/* huy hiệu level + sao */}
        <div className="mt-3 flex items-center justify-center gap-2 animate-[fadeUp_.6s_.15s_ease-out_backwards]">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-gradient-to-b from-amber-300 to-amber-400 px-3.5 py-1 shadow-lg">
            <Trophy size={15} strokeWidth={2.8} className="text-amber-900" />
            <span className="font-display text-[15px] font-black text-amber-950">LEVEL {currentLevel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-white/85 px-3.5 py-1 shadow-lg">
            <Star size={15} strokeWidth={2.5} className="fill-amber-400 text-amber-500" />
            <span className="font-display text-[15px] font-black text-slate-700">{totalStars}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-[#182e27]/90 px-3.5 py-1 shadow-lg">
            <Coins size={15} className="text-amber-300" />
            <span className="font-display text-[15px] font-black text-amber-200">{coins}</span>
          </div>
        </div>

        {/* đảo hiện tại */}
        <div className="mx-auto mt-2 flex w-fit items-center gap-2 rounded-full border-2 border-white/70 px-3 py-1 text-white shadow-lg" style={{ background: `linear-gradient(90deg, ${island.from}, ${island.to})` }}>
          <span className="text-base">{island.icon}</span>
          <span className="font-display text-[13px] font-black">{t.island} {island.index + 1}: {language === 'vi' ? island.nameVi : island.name}</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* hàng bóng mẫu nhún nhảy */}
      <div className="relative z-10 flex items-end justify-center gap-2 pb-1">
        {[0, 1, 2, 3, 4].map((c, i) => (
          <div key={c} style={{ animation: `floatY 2.2s ${i * 0.18}s ease-in-out infinite` }}>
            <Ball color={c} size={34} />
          </div>
        ))}
      </div>

      {/* ── nút PLAY bóng căng ── */}
      <div className="relative z-10 px-10 pb-2 pt-1">
        <button
          onClick={() => { sfx.click(); onPlay(); }}
          className="group relative w-full animate-[playPulse_2s_ease-in-out_infinite] overflow-hidden rounded-full border-b-[7px] border-green-700 bg-gradient-to-b from-lime-300 via-lime-400 to-green-500 py-3.5 shadow-[0_12px_28px_rgba(34,197,94,.45)] active:translate-y-1 active:border-b-[3px]"
        >
          {/* bóng highlight */}
          <div className="pointer-events-none absolute left-4 top-1.5 h-6 w-16 rounded-full bg-white/70 blur-[2px]" />
          <div className="pointer-events-none absolute bottom-1.5 right-8 h-4 w-10 rounded-full bg-white/50 blur-[2px]" />
          <div className="pointer-events-none absolute inset-y-0 w-10 bg-white/40 blur-sm" style={{ animation: 'shineSweep 2.8s ease-in-out infinite' }} />
          <span className="font-display relative flex items-center justify-center gap-2 text-[34px] font-black leading-none tracking-wide text-white" style={{ textShadow: '0 2px 0 #15803d, 0 4px 0 rgba(20,83,45,.9), 0 6px 12px rgba(0,0,0,.3)' }}>
            <Play size={26} strokeWidth={3} className="fill-white" /> PLAY
          </span>
        </button>

        {/* nút phụ */}
        <div className="mt-3 flex items-center justify-center gap-2 pb-5">
          <button onClick={() => { sfx.click(); onLevels(); }} className="flex items-center gap-1.5 rounded-2xl border-b-4 border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 px-3 py-2.5 font-display text-[14px] font-black text-white shadow-lg active:translate-y-0.5 active:border-b-2">
            <LayoutGrid size={16} strokeWidth={2.8} /> {t.levels}
          </button>
          <button onClick={() => { sfx.click(); onCards(); }} className="relative flex items-center gap-1.5 rounded-2xl border-b-4 border-amber-700 bg-gradient-to-b from-amber-300 to-amber-500 px-3 py-2.5 font-display text-[14px] font-black text-[#3b2a0a] shadow-lg active:translate-y-0.5 active:border-b-2">
            <GalleryVerticalEnd size={16} strokeWidth={2.8} /> {t.cards}
            <span className="absolute -right-1.5 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow">{owned}/{CARDS.length}</span>
          </button>
          <button onClick={() => { sfx.click(); onHelp(); }} aria-label="Hướng dẫn" className="grid h-11 w-11 place-items-center rounded-2xl border-b-4 border-violet-800 bg-gradient-to-b from-violet-400 to-violet-600 text-white shadow-lg active:translate-y-0.5 active:border-b-2">
            <CircleHelp size={21} strokeWidth={2.6} />
          </button>
          <button onClick={onSettings} aria-label={t.settings} className="grid h-11 w-11 place-items-center rounded-2xl border-b-4 border-slate-600 bg-gradient-to-b from-slate-200 to-slate-300 text-slate-700 shadow-lg active:translate-y-0.5 active:border-b-2">
            <Settings2 size={21} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
