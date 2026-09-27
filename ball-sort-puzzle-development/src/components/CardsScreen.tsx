import { useMemo, useState } from 'react';
import { ArrowLeft, Layers, X } from 'lucide-react';
import { CardView } from './CardView';
import { CARDS, RARITIES, dropRates, rarityInfo, type MilitaryCard, type Rarity } from '../game/cards';
import { getCollection, type Language } from '../game/storage';
import { text } from '../game/i18n';
import { sfx } from '../game/audio';

interface Props {
  language: Language;
  unlocked: number;
  onBack: () => void;
}

export function CardsScreen({ language, unlocked, onBack }: Props) {
  const t = text(language);
  const collection = useMemo(() => getCollection(), []);
  const [filter, setFilter] = useState<Rarity | 'ALL'>('ALL');
  const [detail, setDetail] = useState<MilitaryCard | null>(null);
  const [showRates, setShowRates] = useState(false);

  const ownedCount = CARDS.filter((c) => collection[c.id]).length;
  const list = filter === 'ALL' ? CARDS : CARDS.filter((c) => c.rarity === filter);
  const rates = dropRates(unlocked);

  return (
    <div className="dark-stage-bg relative flex h-full w-full flex-col overflow-hidden text-white">

      {/* header */}
      <div className="relative z-10 flex items-center gap-2 px-4 pt-5">
        <button onClick={() => { sfx.click(); onBack(); }} className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/35" aria-label="Back"><ArrowLeft size={20} /></button>
        <div className="flex-1 text-center">
          <p className="text-[9px] font-black tracking-[.3em] text-amber-300">{t.cards}</p>
          <h1 className="font-display text-2xl font-black leading-none">{t.collection}</h1>
        </div>
        <button onClick={() => setShowRates(true)} className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/35" aria-label={t.dropRates}><Layers size={18} /></button>
      </div>

      {/* tiến độ */}
      <div className="relative z-10 mx-4 mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-white/60">{t.collected}</span>
          <span className="font-display text-base font-black text-amber-300">{ownedCount} / {CARDS.length}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${(ownedCount / CARDS.length) * 100}%` }} />
        </div>
        <div className="mt-2.5 grid grid-cols-6 gap-1">
          {RARITIES.map((r) => {
            const total = CARDS.filter((c) => c.rarity === r.id).length;
            const got = CARDS.filter((c) => c.rarity === r.id && collection[c.id]).length;
            return (
              <div key={r.id} className="rounded-lg py-1 text-center" style={{ background: r.frame }}>
                <p className="font-display text-[11px] font-black leading-none" style={{ color: r.text }}>{r.id}</p>
                <p className="text-[9px] font-bold text-white/85">{got}/{total}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* bộ lọc */}
      <div className="relative z-10 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {(['ALL', ...RARITIES.map((r) => r.id)] as const).map((f) => (
          <button
            key={f}
            onClick={() => { sfx.click(); setFilter(f); }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition ${filter === f ? 'bg-amber-400 text-[#1a2a22]' : 'bg-white/10 text-white/70'}`}
          >
            {f === 'ALL' ? t.all : f}
          </button>
        ))}
      </div>

      {/* lưới thẻ */}
      <div className="nice-scroll relative z-10 mt-2 flex-1 overflow-y-auto px-4 pb-5">
        <div className="grid grid-cols-4 justify-items-center gap-2">
          {list.map((c) => (
            <CardView
              key={c.id}
              card={c}
              width={84}
              language={language}
              count={collection[c.id]}
              locked={!collection[c.id]}
              onClick={() => { sfx.click(); setDetail(c); }}
            />
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/40">{t.cardOnce}</p>
      </div>

      {/* chi tiết thẻ */}
      {detail && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-md" onClick={() => setDetail(null)}>
          <div className="animate-[cardFlip_.5s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <CardView card={detail} width={220} language={language} />
          </div>
          <div className="mt-4 text-center">
            <p className="font-display text-lg font-black" style={{ color: rarityInfo(detail.rarity).text }}>
              {detail.rarity} · {language === 'vi' ? rarityInfo(detail.rarity).nameVi : rarityInfo(detail.rarity).name}
            </p>
            <p className="text-xs text-white/60">{t.power}: {detail.power.toLocaleString()} · {t.owned}: ×{collection[detail.id]}</p>
          </div>
          <button onClick={() => setDetail(null)} className="mt-5 grid size-11 place-items-center rounded-full bg-white/10" aria-label={t.close}><X size={20} /></button>
        </div>
      )}

      {/* tỉ lệ rơi */}
      {showRates && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-6 backdrop-blur-md" onClick={() => setShowRates(false)}>
          <div className="w-full max-w-[320px] rounded-[26px] border border-white/15 bg-[#172b28] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-black">{t.dropRates}</h3>
            <p className="text-[11px] text-white/50">Level {unlocked}</p>
            <div className="mt-3 space-y-2">
              {RARITIES.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="w-11 rounded-md py-0.5 text-center font-display text-xs font-black" style={{ background: r.frame, color: r.text }}>{r.id}</span>
                  <span className="flex-1 truncate text-xs text-white/75">{language === 'vi' ? r.nameVi : r.name}</span>
                  <span className="font-display text-sm font-black text-amber-200">{rates[r.id].toFixed(2)}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/45">{t.cardOnce}</p>
            <button onClick={() => setShowRates(false)} className="mt-4 w-full rounded-xl bg-amber-400 py-2.5 font-black text-[#172b28]">{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
