// ─── Lưu tiến trình vào localStorage ───
const K = {
  unlocked: 'btb_unlocked',
  stars: 'btb_stars',
  sound: 'btb_sound',
  best: 'btb_best',
  coins: 'btb_coins',
  rewarded: 'btb_rewarded',
  language: 'btb_language',
  music: 'btb_music',
};

export function getUnlocked(): number {
  try { return Math.max(1, parseInt(localStorage.getItem(K.unlocked) || '1', 10) || 1); }
  catch { return 1; }
}
export function setUnlocked(level: number) {
  try {
    const cur = getUnlocked();
    const capped = Math.min(10000, level);
    if (capped > cur) localStorage.setItem(K.unlocked, String(capped));
  } catch { /* noop */ }
}

// ─── Bộ sưu tập thẻ: { cardId: số lượng } ───
const CARD_KEY = 'btb_cards';
export function getCollection(): Record<string, number> {
  try {
    const collection = JSON.parse(localStorage.getItem(CARD_KEY) || '{}') as Record<string, number>;
    if (!collection || typeof collection !== 'object') return {};

    // Old portrait slots 3 and 10 were removed; keep every other ID unchanged.
    const removed = Object.keys(collection).filter((id) => /^(3|10)-/.test(id));
    if (removed.length) {
      removed.forEach((id) => delete collection[id]);
      localStorage.setItem(CARD_KEY, JSON.stringify(collection));
    }
    return collection;
  } catch { return {}; }
}
/** Thêm thẻ, trả về số lượng sau khi thêm */
export function addCard(id: string): number {
  try {
    const col = getCollection();
    col[id] = (col[id] || 0) + 1;
    localStorage.setItem(CARD_KEY, JSON.stringify(col));
    return col[id];
  } catch { return 1; }
}
export function getStars(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem(K.stars) || '{}'); }
  catch { return {}; }
}
export function setStar(level: number, star: number) {
  try {
    const s = getStars();
    s[level] = Math.max(s[level] || 0, star);
    localStorage.setItem(K.stars, JSON.stringify(s));
  } catch { /* noop */ }
}

export function getSoundPref(): boolean {
  try { return (localStorage.getItem(K.sound) ?? '1') === '1'; }
  catch { return true; }
}
export function setSoundPref(v: boolean) {
  try { localStorage.setItem(K.sound, v ? '1' : '0'); } catch { /* noop */ }
}

export function getBest(level: number): number | null {
  try {
    const b = JSON.parse(localStorage.getItem(K.best) || '{}');
    return b[level] ?? null;
  } catch { return null; }
}
export function setBest(level: number, moves: number) {
  try {
    const b = JSON.parse(localStorage.getItem(K.best) || '{}');
    if (!b[level] || moves < b[level]) {
      b[level] = moves;
      localStorage.setItem(K.best, JSON.stringify(b));
    }
  } catch { /* noop */ }
}

export type Language = 'en' | 'vi';
export function getLanguage(): Language {
  try { return localStorage.getItem(K.language) === 'vi' ? 'vi' : 'en'; }
  catch { return 'en'; }
}
export function setLanguage(language: Language) {
  try { localStorage.setItem(K.language, language); } catch { /* unavailable */ }
}
export function getMusicPref(): boolean {
  try { return (localStorage.getItem(K.music) ?? '1') === '1'; }
  catch { return true; }
}
export function setMusicPref(value: boolean) {
  try { localStorage.setItem(K.music, value ? '1' : '0'); } catch { /* unavailable */ }
}
export function getCoins(): number {
  try { return Math.max(0, Number(localStorage.getItem(K.coins)) || 0); }
  catch { return 0; }
}
// Rewards are paid only once per level, even after replaying or reloading.
export function rewardLevel(level: number, amount: number): number {
  try {
    const rewarded: number[] = JSON.parse(localStorage.getItem(K.rewarded) || '[]');
    if (rewarded.includes(level)) return 0;
    localStorage.setItem(K.rewarded, JSON.stringify([...rewarded, level]));
    localStorage.setItem(K.coins, String(getCoins() + amount));
    return amount;
  } catch { return 0; }
}
