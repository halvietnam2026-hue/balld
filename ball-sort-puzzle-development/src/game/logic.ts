// ─── Logic lõi của Ball Sort (Stack / kiểm tra di chuyển / thắng) ───
export const CAPACITY = 4;

export type Tubes = number[][]; // mỗi ống là 1 stack: index 0 = đáy, cuối = đỉnh

export const cloneTubes = (t: Tubes): Tubes => t.map((tube) => [...tube]);

/** Đếm số bóng cùng màu liên tiếp ở đỉnh ống (để di chuyển cả cụm) */
export function topRunCount(tube: number[]): number {
  if (tube.length === 0) return 0;
  const top = tube[tube.length - 1];
  let n = 1;
  for (let i = tube.length - 2; i >= 0; i--) {
    if (tube[i] === top) n++;
    else break;
  }
  return n;
}

/**
 * Kiểm tra logic di chuyển (theo spec):
 * 1. Ống nguồn phải có bóng
 * 2. Ống đích chưa đầy
 * 3. Ống đích trống HOẶC đỉnh cùng màu
 */
export function canMove(tubes: Tubes, from: number, to: number): boolean {
  if (from === to) return false;
  const src = tubes[from];
  const dst = tubes[to];
  if (!src || !dst) return false;
  if (src.length === 0) return false;
  if (dst.length >= CAPACITY) return false;
  if (dst.length === 0) return true;
  return src[src.length - 1] === dst[dst.length - 1];
}

/** Số bóng có thể di chuyển trong 1 nước (cụm cùng màu, giới hạn bởi chỗ trống) */
export function movableCount(tubes: Tubes, from: number, to: number): number {
  if (!canMove(tubes, from, to)) return 0;
  const run = topRunCount(tubes[from]);
  const space = CAPACITY - tubes[to].length;
  return Math.min(run, space);
}

/** Áp dụng 1 nước đi (di chuyển cả cụm), trả về trạng thái mới + số bóng đã chuyển */
export function applyMove(tubes: Tubes, from: number, to: number): { next: Tubes; moved: number } {
  const n = movableCount(tubes, from, to);
  if (n === 0) return { next: tubes, moved: 0 };
  const next = cloneTubes(tubes);
  for (let i = 0; i < n; i++) {
    const ball = next[from].pop()!;
    next[to].push(ball);
  }
  return { next, moved: n };
}

/** 1 ống hoàn thành khi: trống HOẶC đầy 4 bóng cùng màu */
export function isTubeComplete(tube: number[]): boolean {
  if (tube.length === 0) return true;
  if (tube.length !== CAPACITY) return false;
  return tube.every((c) => c === tube[0]);
}

/** Kiểm tra thắng: TẤT CẢ ống đều hoàn thành */
export function isWin(tubes: Tubes): boolean {
  return tubes.every(isTubeComplete);
}

/** Số ống đã hoàn thành (đầy đúng màu, không tính ống trống) */
export function completedCount(tubes: Tubes): number {
  return tubes.filter((t) => t.length === CAPACITY && t.every((c) => c === t[0])).length;
}

export function totalColorCount(tubes: Tubes): number {
  return tubes.filter((t) => t.length > 0).length;
}

/** Gợi ý nước đi tốt nhất (heuristic) */
export function findHint(tubes: Tubes): [number, number] | null {
  const candidates: { from: number; to: number; score: number }[] = [];

  for (let from = 0; from < tubes.length; from++) {
    const src = tubes[from];
    if (src.length === 0) continue;
    // Bỏ qua ống đã hoàn chỉnh (đầy cùng màu) — không cần động vào
    if (isTubeComplete(src) && src.length === CAPACITY) continue;

    for (let to = 0; to < tubes.length; to++) {
      if (!canMove(tubes, from, to)) continue;
      const dst = tubes[to];
      const color = src[src.length - 1];
      let score = 10;

      // Ưu tiên đổ vào ống đã có cùng màu (gom lại)
      if (dst.length > 0) {
        score += dst.length * 12;
        // Nếu đổ xong đầy ống → điểm rất cao
        const run = topRunCount(src);
        const space = CAPACITY - dst.length;
        if (run >= space && dst.every((c) => c === color)) score += 80;
      } else {
        // Đổ ra ống trống: chỉ tốt khi ống nguồn đang lộn xộn (nhiều màu)
        const distinct = new Set(src).size;
        if (distinct <= 1) score -= 60; // ống 1 màu thì đừng đổ ra ngoài
        else score += distinct * 6;
        // Nếu nguồn chỉ có 1 bóng mà đổ qua ống trống thì vô nghĩa
        if (src.length === 1) score -= 80;
      }

      // Ưu tiên lật ra bóng giúp ống nguồn thành 1 màu
      const after = src.length - Math.min(topRunCount(src), CAPACITY - dst.length);
      if (after === 0) score += 15;
      else {
        const remain = src.slice(0, after);
        if (remain.length > 0 && remain.every((c) => c === remain[0])) score += 40;
      }

      // Tránh đổ 1 ống 1-màu đầy đủ sang ống trống (di chuyển vô ích)
      if (dst.length === 0 && new Set(src).size === 1) score -= 100;

      candidates.push({ from, to, score });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  if (candidates[0].score < -50) return null;
  return [candidates[0].from, candidates[0].to];
}

/** Kiểm tra còn nước đi nào không (kẹt cứng?) — bỏ qua ống đã khóa (đầy cùng màu) */
export function hasAnyMove(tubes: Tubes): boolean {
  for (let i = 0; i < tubes.length; i++) {
    if (tubes[i].length === CAPACITY && isTubeComplete(tubes[i])) continue;
    for (let j = 0; j < tubes.length; j++) if (canMove(tubes, i, j)) return true;
  }
  return false;
}
