// 9 countries x 12 roles = 108 cards across 6 rarities.
import { portraits } from './soldiers';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'LR';

export interface RarityInfo {
  id: Rarity;
  name: string;
  nameVi: string;
  weight: number;      // tỉ lệ cơ bản (%)
  frame: string;       // gradient khung
  text: string;        // màu chữ nhãn
  glow: string;        // hào quang
  basePower: number;
}

export const RARITIES: RarityInfo[] = [
  { id: 'N', name: 'Normal', nameVi: 'Thường', weight: 78.5, frame: 'linear-gradient(145deg,#9ca3af,#4b5563)', text: '#e5e7eb', glow: 'rgba(156,163,175,.45)', basePower: 100 },
  { id: 'R', name: 'Rare', nameVi: 'Hiếm', weight: 17, frame: 'linear-gradient(145deg,#60a5fa,#1d4ed8)', text: '#dbeafe', glow: 'rgba(59,130,246,.55)', basePower: 250 },
  { id: 'SR', name: 'Super Rare', nameVi: 'Siêu Hiếm', weight: 3.5, frame: 'linear-gradient(145deg,#c084fc,#6d28d9)', text: '#f3e8ff', glow: 'rgba(168,85,247,.6)', basePower: 500 },
  { id: 'SSR', name: 'Specially Super Rare', nameVi: 'Đặc Biệt Siêu Hiếm', weight: 0.8, frame: 'linear-gradient(145deg,#fde68a,#f59e0b,#b45309)', text: '#fef3c7', glow: 'rgba(245,158,11,.7)', basePower: 900 },
  { id: 'UR', name: 'Ultra Rare', nameVi: 'Cực Kỳ Quý Hiếm', weight: 0.18, frame: 'linear-gradient(145deg,#fb7185,#e11d48,#7f1d1d)', text: '#ffe4e6', glow: 'rgba(244,63,94,.75)', basePower: 1500 },
  { id: 'LR', name: 'Legendary Rare', nameVi: 'Huyền Thoại Tối Cao', weight: 0.02, frame: 'linear-gradient(135deg,#f472b6,#facc15,#4ade80,#38bdf8,#a78bfa,#f472b6)', text: '#ffffff', glow: 'rgba(250,204,21,.85)', basePower: 2500 },
];

export const rarityInfo = (r: Rarity) => RARITIES.find((x) => x.id === r)!;

const ROLES: Record<Rarity, { en: string; vi: string; icon: string }[]> = {
  N: [{ en: 'Recruit', vi: 'Tân Binh', icon: '🎖️' }, { en: 'Cadet', vi: 'Học Viên', icon: '📘' }],
  R: [{ en: 'Rifleman', vi: 'Xạ Thủ', icon: '🎯' }, { en: 'Scout', vi: 'Trinh Sát', icon: '🔭' }],
  SR: [{ en: 'Sniper', vi: 'Bắn Tỉa', icon: '🦅' }, { en: 'Tank Commander', vi: 'Chỉ Huy Xe Tăng', icon: '🛡️' }],
  SSR: [{ en: 'Special Forces', vi: 'Đặc Nhiệm', icon: '⚡' }, { en: 'Paratrooper', vi: 'Lính Dù', icon: '🪂' }],
  UR: [{ en: 'Colonel', vi: 'Đại Tá', icon: '⭐' }, { en: 'Fighter Ace', vi: 'Phi Công Át', icon: '✈️' }],
  LR: [{ en: 'Field Marshal', vi: 'Thống Chế', icon: '👑' }, { en: 'War Legend', vi: 'Huyền Thoại', icon: '🔥' }],
};

export interface MilitaryCard {
  id: string;
  country: string;
  image: string;
  position: string;
  zoom: number;
  filter: string;
  rarity: Rarity;
  title: string;
  titleVi: string;
  icon: string;
  power: number;
}

const POSITIONS = ['center 25%', '60% 20%', '40% 30%', '70% 25%'];

export const CARDS: MilitaryCard[] = (() => {
  const list: MilitaryCard[] = [];
  portraits.forEach((p) => {
    const ci = p.id;
    RARITIES.forEach((r, ri) => {
      ROLES[r.id].forEach((role, k) => {
        list.push({
          id: `${ci}-${r.id}-${k}`,
          country: p.country,
          image: `/images/${p.file}`,
          position: POSITIONS[(ci + ri + k) % POSITIONS.length],
          zoom: 150 + ((ci * 7 + ri * 11 + k * 13) % 5) * 12,
          filter: ci >= 8 ? 'saturate(.8) contrast(1.08)' : k === 1 ? 'saturate(1.08) contrast(1.05)' : 'none',
          rarity: r.id,
          title: role.en,
          titleVi: role.vi,
          icon: role.icon,
          power: r.basePower + ((ci * 37 + k * 53) % 90),
        });
      });
    });
  });
  return list;
})();

export const cardById = (id: string) => CARDS.find((c) => c.id === id);

/**
 * Base rates sum to 100%. Later levels get only a small boost to rare cards;
 * every tier remains significantly harder to obtain than the tier before it.
 */
export function dropRates(level: number): Record<Rarity, number> {
  const progress = Math.min(1, Math.max(0, (level - 1) / 9999));
  const lateShift: Record<Rarity, number> = {
    N: -2, R: 1, SR: 0.7, SSR: 0.2, UR: 0.09, LR: 0.01,
  };
  const rates = {} as Record<Rarity, number>;
  for (const rarity of RARITIES) {
    rates[rarity.id] = rarity.weight + lateShift[rarity.id] * progress;
  }
  return rates;
}

export function drawCard(level: number): MilitaryCard {
  const rates = dropRates(level);
  let roll = Math.random() * 100;
  let rarity: Rarity = 'N';
  for (const r of RARITIES) {
    roll -= rates[r.id];
    if (roll <= 0) { rarity = r.id; break; }
  }
  const pool = CARDS.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
