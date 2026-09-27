// ─── Sinh màn chơi theo Level (seeded, ổn định) ───
import { CAPACITY, type Tubes } from './logic';

export interface LevelConfig {
  level: number;
  colors: number;
  tubes: number;
  empty: number;
}

/** Cấu hình độ khó theo level */
export function getLevelConfig(level: number): LevelConfig {
  let colors: number, tubes: number;
  if (level <= 1) { colors = 2; tubes = 3; }
  else if (level === 2) { colors = 3; tubes = 5; }
  else if (level === 3) { colors = 3; tubes = 5; }
  else if (level <= 5) { colors = 4; tubes = 6; }
  else if (level <= 10) { colors = 5; tubes = 7; }
  else if (level <= 15) { colors = 6; tubes = 8; }
  else if (level <= 25) { colors = 7; tubes = 9; }
  else if (level <= 40) { colors = 8; tubes = 10; }
  else if (level <= 60) { colors = 9; tubes = 11; }
  else if (level <= 100) { colors = 10; tubes = 12; }
  else if (level <= 150) { colors = 11; tubes = 14; }
  else { colors = 12; tubes = 15; }

  // Một số màn thử thách chỉ có 1 ống trống
  // Màn thử thách: bớt ống trống (tối thiểu 2 để luôn có đường giải)
  const hard = level > 10 && level % 9 === 0 && tubes - colors > 2;
  const empty = hard ? 2 : tubes - colors;
  const finalTubes = hard ? colors + 2 : tubes;
  return { level, colors, tubes: finalTubes, empty };
}

// RNG có seed — cùng 1 level luôn sinh ra cùng 1 màn
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isTubeSolved(tube: number[]): boolean {
  return tube.length === CAPACITY && tube.every((c) => c === tube[0]);
}

/** Điểm "trộn" — số lần đổi màu trong các ống (càng cao càng khó) */
function mixScore(tubes: Tubes): number {
  let s = 0;
  for (const t of tubes) {
    for (let i = 1; i < t.length; i++) if (t[i] !== t[i - 1]) s++;
  }
  return s;
}

export function generateLevel(level: number): { config: LevelConfig; tubes: Tubes; colorIds: number[] } {
  const config = getLevelConfig(level);
  const rand = mulberry32(level * 987654321 + 12345);

  // Chọn tập màu cho màn (xáo trộn thứ tự để mỗi màn khác nhau)
  const colorIds = shuffled([...Array(12).keys()], rand).slice(0, config.colors);

  // ── Màn 1: thủ công — chỉ 2 bước là thắng ──
  if (level === 1) {
    const [a, b] = colorIds;
    return { config, colorIds, tubes: [[a, a, a], [b, b, b], [a, b]] };
  }
  // ── Màn 2: thủ công — 3 bước ──
  if (level === 2) {
    const [a, b, c] = colorIds;
    return { config, colorIds, tubes: [[a, a, a], [b, b, b], [c, c, c], [a, b, c], []] };
  }

  const filledTubes = config.tubes - config.empty;
  const minMix = Math.min(filledTubes * 2, 4 + Math.floor(level / 4));

  let best: Tubes | null = null;

  for (let attempt = 0; attempt < 300; attempt++) {
    // Tạo túi bóng: mỗi màu đúng 4 quả
    const bag: number[] = [];
    for (const c of colorIds) for (let i = 0; i < CAPACITY; i++) bag.push(c);
    const mixed = shuffled(bag, rand);

    const tubes: Tubes = [];
    for (let i = 0; i < filledTubes; i++) {
      tubes.push(mixed.slice(i * CAPACITY, i * CAPACITY + CAPACITY));
    }
    for (let i = 0; i < config.empty; i++) tubes.push([]);

    // Loại bỏ màn có ống đã giải sẵn
    if (tubes.some(isTubeSolved)) continue;
    // Màn đầu phải có ít nhất 1 nước đi lộ ra là khác màu chồng nhau
    const score = mixScore(tubes);
    if (score < minMix) {
      if (!best) best = tubes;
      continue;
    }
    // Đảm bảo không có ống nào toàn 1 màu nằm dưới đáy mà đỉnh khác (quá dễ)? vẫn chấp nhận
    return { config, colorIds, tubes };
  }

  return { config, colorIds, tubes: best! };
}

/** Số bước chuẩn (par) để tính sao */
export function parMoves(level: number, colors: number): number {
  return Math.round(colors * 4.2 + level * 0.12 + 4);
}

export function starsFor(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= par) return 3;
  if (moves <= Math.round(par * 1.6)) return 2;
  return 1;
}
