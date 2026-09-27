import { memo } from 'react';
import { rarityInfo, type MilitaryCard } from '../game/cards';
import type { Language } from '../game/storage';

interface Props {
  card: MilitaryCard;
  width: number;
  language: Language;
  count?: number;
  locked?: boolean;
  onClick?: () => void;
}

/** Thẻ quân đội tỉ lệ 2:3 — khung màu theo độ hiếm */
export const CardView = memo(function CardView({ card, width, language, count, locked, onClick }: Props) {
  const r = rarityInfo(card.rarity);
  const h = width * 1.5;
  const big = width >= 150;
  const premium = card.rarity === 'SSR' || card.rarity === 'UR' || card.rarity === 'LR';

  if (locked) {
    return (
      <div className="relative grid place-items-center rounded-xl border-2 border-white/10 bg-black/35" style={{ width, height: h }}>
        <span className="font-display text-3xl font-black text-white/15">?</span>
        <span className="absolute bottom-1.5 rounded-full px-1.5 text-[9px] font-black" style={{ color: r.text, background: 'rgba(0,0,0,.4)' }}>{r.id}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 overflow-hidden text-left ${card.rarity === 'LR' ? 'animate-[hueSpin_4s_linear_infinite]' : ''}`}
      style={{
        width, height: h, borderRadius: big ? 18 : 12, padding: big ? 5 : 3,
        background: r.frame,
        boxShadow: `0 6px 16px rgba(0,0,0,.45), 0 0 ${premium ? 18 : 8}px ${r.glow}`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: big ? 14 : 9 }}>
        {/* ảnh lính */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${card.image})`,
            backgroundSize: `${card.zoom}%`,
            backgroundPosition: card.position,
            filter: card.filter,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/90" />

        {/* ánh holo cho thẻ cao cấp */}
        {premium && (
          <div
            className="pointer-events-none absolute inset-y-0 w-1/2 mix-blend-overlay"
            style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent)', animation: 'shineSweep 3s ease-in-out infinite' }}
          />
        )}

        {/* nhãn độ hiếm */}
        <div
          className="absolute left-1 top-1 rounded-md px-1.5 font-display font-black leading-tight shadow"
          style={{ background: r.frame, color: r.text, fontSize: big ? 16 : 10, textShadow: '0 1px 2px rgba(0,0,0,.5)' }}
        >
          {card.rarity}
        </div>
        <div className="absolute right-1 top-1" style={{ fontSize: big ? 20 : 12 }}>{card.icon}</div>

        {count !== undefined && count > 1 && (
          <div className="absolute right-1 top-6 rounded-full bg-black/70 px-1.5 text-[9px] font-black text-amber-200">×{count}</div>
        )}

        {/* thông tin dưới */}
        <div className="absolute inset-x-0 bottom-0 p-1.5">
          <p className="truncate font-black tracking-wider text-white/70" style={{ fontSize: big ? 10 : 7 }}>{card.country}</p>
          <p className="font-display font-black leading-tight text-white" style={{ fontSize: big ? 18 : 10.5 }}>
            {language === 'vi' ? card.titleVi : card.title}
          </p>
          {big && (
            <p className="mt-0.5 text-[11px] font-black" style={{ color: r.text }}>
              ⚔️ {card.power.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </button>
  );
});
