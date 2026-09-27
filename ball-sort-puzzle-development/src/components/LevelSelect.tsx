import { useState } from 'react';
import { ArrowLeft, Lock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { sfx } from '../game/audio';
import type { Language } from '../game/storage';
import { text } from '../game/i18n';
import { ISLANDS, LEVELS_PER_ISLAND, islandIndexForLevel, islandRange } from '../game/islands';

interface Props {
  unlocked: number;
  stars: Record<number, number>;
  language: Language;
  onBack: () => void;
  onPick: (level: number) => void;
}

const PAGE = 50;
const PAGES = LEVELS_PER_ISLAND / PAGE; // 10 trang / đảo

export function LevelSelect({ unlocked, stars, language, onBack, onPick }: Props) {
  const t = text(language);
  const currentIsland = islandIndexForLevel(unlocked);
  const [islandIdx, setIslandIdx] = useState(currentIsland);
  const [page, setPage] = useState(() => Math.floor(((unlocked - 1) % LEVELS_PER_ISLAND) / PAGE));

  const island = ISLANDS[islandIdx];
  const [start, end] = islandRange(islandIdx);
  const islandLocked = start > unlocked;
  const pageStart = start + page * PAGE;
  const levels = Array.from({ length: PAGE }, (_, i) => pageStart + i);
  const islandDone = Math.max(0, Math.min(unlocked - 1, end) - start + 1);

  const chooseIsland = (i: number) => {
    sfx.click();
    setIslandIdx(i);
    const [s] = islandRange(i);
    setPage(unlocked >= s && unlocked <= s + LEVELS_PER_ISLAND - 1 ? Math.floor((unlocked - s) / PAGE) : 0);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden text-white">
      <div className="absolute inset-0 transition-all duration-500" style={{ background: `linear-gradient(170deg, ${island.from}, ${island.to})` }} />
      <div className="pointer-events-none absolute -right-10 top-16 select-none text-[180px] opacity-10">{island.icon}</div>

      {/* header */}
      <div className="relative z-10 flex items-center gap-2 px-4 pt-5">
        <button onClick={() => { sfx.click(); onBack(); }} className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/30" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display flex-1 text-center text-2xl font-black tracking-wide">{t.selectLevel}</h2>
        <div className="w-10" />
      </div>

      {/* danh sách đảo */}
      <div className="nice-scroll relative z-10 mt-3 flex gap-2 overflow-x-auto px-4 pb-2">
        {ISLANDS.map((isl) => {
          const locked = islandRange(isl.index)[0] > unlocked;
          const active = isl.index === islandIdx;
          return (
            <button
              key={isl.index}
              onClick={() => chooseIsland(isl.index)}
              className={`relative flex w-[74px] shrink-0 flex-col items-center rounded-2xl border-2 px-1 py-2 transition ${active ? 'scale-105 border-white bg-white/25' : 'border-white/15 bg-black/25'}`}
            >
              <span className={`text-2xl ${locked ? 'opacity-35 grayscale' : ''}`}>{isl.icon}</span>
              <span className="mt-0.5 text-[9px] font-black text-white/60">{t.island} {isl.index + 1}</span>
              <span className="w-full truncate text-center text-[9.5px] font-extrabold leading-tight">{language === 'vi' ? isl.nameVi : isl.name}</span>
              {locked && <Lock size={11} className="absolute right-1.5 top-1.5 text-white/60" />}
            </button>
          );
        })}
      </div>

      {/* thông tin đảo */}
      <div className="relative z-10 mx-4 mt-1 rounded-2xl border border-white/15 bg-black/25 p-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{island.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black tracking-[.25em]" style={{ color: island.accent }}>{t.island.toUpperCase()} {islandIdx + 1} / {ISLANDS.length}</p>
            <p className="font-display truncate text-xl font-black leading-tight">{language === 'vi' ? island.nameVi : island.name}</p>
            <p className="text-[11px] text-white/60">Level {start.toLocaleString()} – {end.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-black" style={{ color: island.accent }}>{islandDone}</p>
            <p className="text-[10px] text-white/50">/ {LEVELS_PER_ISLAND}</p>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full" style={{ width: `${(islandDone / LEVELS_PER_ISLAND) * 100}%`, background: island.accent }} />
        </div>
      </div>

      {/* phân trang */}
      <div className="relative z-10 mx-4 mt-2 flex items-center gap-2">
        <button disabled={page === 0} onClick={() => { sfx.click(); setPage(page - 1); }} className="grid size-8 place-items-center rounded-full bg-black/30 disabled:opacity-30" aria-label="Prev"><ChevronLeft size={18} /></button>
        <div className="flex flex-1 justify-center gap-1">
          {Array.from({ length: PAGES }, (_, i) => (
            <button key={i} onClick={() => { sfx.click(); setPage(i); }} className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-white' : 'w-2 bg-white/35'}`} aria-label={`Page ${i + 1}`} />
          ))}
        </div>
        <button disabled={page === PAGES - 1} onClick={() => { sfx.click(); setPage(page + 1); }} className="grid size-8 place-items-center rounded-full bg-black/30 disabled:opacity-30" aria-label="Next"><ChevronRight size={18} /></button>
      </div>
      <p className="relative z-10 mt-1 text-center text-[11px] font-bold text-white/60">{pageStart.toLocaleString()} – {(pageStart + PAGE - 1).toLocaleString()}</p>

      {/* lưới màn */}
      <div className="nice-scroll relative z-10 mx-4 mb-4 mt-2 flex-1 overflow-y-auto rounded-2xl border border-white/15 bg-black/20 p-3">
        {islandLocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Lock size={36} className="text-white/50" />
            <p className="text-sm font-bold text-white/70">{t.islandLocked}</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {levels.map((lv) => {
              const locked = lv > unlocked;
              const st = stars[lv] || 0;
              const current = lv === unlocked;
              return (
                <button
                  key={lv}
                  disabled={locked}
                  onClick={() => { sfx.click(); onPick(lv); }}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border-b-4 font-display font-black transition active:translate-y-0.5 active:border-b-2 ${
                    locked
                      ? 'border-black/20 bg-white/10 text-white/30'
                      : current
                        ? 'animate-[playPulse_2s_ease-in-out_infinite] border-amber-600 bg-gradient-to-b from-amber-300 to-amber-500 text-[#3b2a0a]'
                        : 'border-black/25 bg-white/90 text-slate-800'
                  }`}
                >
                  {locked ? <Lock size={14} /> : (
                    <>
                      <span className={`leading-none ${lv >= 1000 ? 'text-[11px]' : 'text-[15px]'}`}>{lv}</span>
                      <span className="mt-0.5 flex">
                        {[1, 2, 3].map((i) => (
                          <Star key={i} size={8} className={i <= st ? 'fill-amber-400 text-amber-500' : 'fill-black/15 text-black/10'} />
                        ))}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
