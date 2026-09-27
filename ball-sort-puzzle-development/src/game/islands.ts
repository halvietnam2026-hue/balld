// ─── 20 đảo × 500 màn = 10.000 màn ───
export const LEVELS_PER_ISLAND = 500;
export const MAX_LEVEL = 10000;

export interface Island {
  index: number; // 0-based
  name: string;
  nameVi: string;
  icon: string;
  from: string; // gradient màu
  to: string;
  accent: string;
}

export const ISLANDS: Island[] = [
  { index: 0, name: 'Island War', nameVi: 'Chiến Tranh Đảo', icon: '🏝️', from: '#0e7490', to: '#14532d', accent: '#67e8f9' },
  { index: 1, name: 'Mountain War', nameVi: 'Chiến Tranh Núi', icon: '⛰️', from: '#475569', to: '#1e293b', accent: '#cbd5e1' },
  { index: 2, name: 'Desert Storm', nameVi: 'Bão Sa Mạc', icon: '🏜️', from: '#b45309', to: '#78350f', accent: '#fcd34d' },
  { index: 3, name: 'Jungle Ops', nameVi: 'Chiến Dịch Rừng Rậm', icon: '🌴', from: '#15803d', to: '#052e16', accent: '#86efac' },
  { index: 4, name: 'Arctic Front', nameVi: 'Mặt Trận Bắc Cực', icon: '🧊', from: '#0284c7', to: '#1e3a8a', accent: '#bae6fd' },
  { index: 5, name: 'Ocean Strike', nameVi: 'Tấn Công Đại Dương', icon: '🌊', from: '#1d4ed8', to: '#172554', accent: '#93c5fd' },
  { index: 6, name: 'Canyon Siege', nameVi: 'Vây Hãm Hẻm Núi', icon: '🪨', from: '#c2410c', to: '#431407', accent: '#fdba74' },
  { index: 7, name: 'Volcano Front', nameVi: 'Mặt Trận Núi Lửa', icon: '🌋', from: '#b91c1c', to: '#1c1917', accent: '#fca5a5' },
  { index: 8, name: 'Urban Warfare', nameVi: 'Chiến Tranh Đô Thị', icon: '🏙️', from: '#52525b', to: '#18181b', accent: '#e4e4e7' },
  { index: 9, name: 'Swamp Battle', nameVi: 'Trận Đầm Lầy', icon: '🐊', from: '#4d7c0f', to: '#1a2e05', accent: '#bef264' },
  { index: 10, name: 'Sky Fortress', nameVi: 'Pháo Đài Trên Không', icon: '✈️', from: '#0ea5e9', to: '#312e81', accent: '#e0f2fe' },
  { index: 11, name: 'Tundra Campaign', nameVi: 'Chiến Dịch Lãnh Nguyên', icon: '❄️', from: '#64748b', to: '#0f172a', accent: '#f1f5f9' },
  { index: 12, name: 'River Assault', nameVi: 'Tấn Công Sông', icon: '🚤', from: '#0d9488', to: '#134e4a', accent: '#5eead4' },
  { index: 13, name: 'Glacier War', nameVi: 'Chiến Tranh Sông Băng', icon: '🏔️', from: '#38bdf8', to: '#0c4a6e', accent: '#f0f9ff' },
  { index: 14, name: 'Savanna Raid', nameVi: 'Đột Kích Thảo Nguyên', icon: '🦁', from: '#ca8a04', to: '#422006', accent: '#fde68a' },
  { index: 15, name: 'Steel Valley', nameVi: 'Thung Lũng Thép', icon: '⚙️', from: '#6b7280', to: '#111827', accent: '#d1d5db' },
  { index: 16, name: 'Storm Coast', nameVi: 'Bờ Biển Bão Tố', icon: '⛈️', from: '#4338ca', to: '#1e1b4b', accent: '#c7d2fe' },
  { index: 17, name: 'Iron Plateau', nameVi: 'Cao Nguyên Sắt', icon: '🛡️', from: '#7c2d12', to: '#1c1917', accent: '#fed7aa' },
  { index: 18, name: 'Shadow Forest', nameVi: 'Rừng Bóng Tối', icon: '🌲', from: '#166534', to: '#020617', accent: '#a7f3d0' },
  { index: 19, name: 'Final Frontier', nameVi: 'Biên Giới Cuối Cùng', icon: '👑', from: '#a21caf', to: '#1e1b4b', accent: '#f5d0fe' },
];

export function islandIndexForLevel(level: number): number {
  return Math.min(ISLANDS.length - 1, Math.floor((Math.max(1, level) - 1) / LEVELS_PER_ISLAND));
}

export function islandForLevel(level: number): Island {
  return ISLANDS[islandIndexForLevel(level)];
}

/** Thứ tự màn trong đảo: 1..500 */
export function stageInIsland(level: number): number {
  return ((level - 1) % LEVELS_PER_ISLAND) + 1;
}

export function islandRange(index: number): [number, number] {
  const start = index * LEVELS_PER_ISLAND + 1;
  return [start, start + LEVELS_PER_ISLAND - 1];
}
