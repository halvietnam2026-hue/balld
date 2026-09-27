// ─── Bảng màu bóng (giống ảnh mẫu: bóng bóng căng, glossy) ───
export interface BallColor {
  id: number;
  name: string;
  base: string;
  dark: string;
  deep: string;
  light: string;
  ring: string;
}

export const BALL_COLORS: BallColor[] = [
  { id: 0, name: 'Đỏ',     base: '#ef2b2b', dark: '#a31212', deep: '#7a0d0d', light: '#ffb3ab', ring: '#b91c1c' },
  { id: 1, name: 'Cam',    base: '#ff8f1f', dark: '#c25e00', deep: '#8f4300', light: '#ffd9a8', ring: '#c25700' },
  { id: 2, name: 'Vàng',   base: '#ffd91a', dark: '#d9a400', deep: '#9c7600', light: '#fff3a3', ring: '#d9a400' },
  { id: 3, name: 'Xanh lá',base: '#35c759', dark: '#1a7a33', deep: '#0f5423', light: '#b2f2c4', ring: '#1a7a33' },
  { id: 4, name: 'Xanh dương', base: '#2f80ed', dark: '#1453ad', deep: '#0c3a7d', light: '#b3d4ff', ring: '#1453ad' },
  { id: 5, name: 'Tím',    base: '#9333ea', dark: '#5b1a99', deep: '#3d1168', light: '#dab8ff', ring: '#6d21a8' },
  { id: 6, name: 'Nâu',    base: '#8d5a3b', dark: '#59371f', deep: '#3d2413', light: '#e3c39f', ring: '#5f3d22' },
  { id: 7, name: 'Đen',    base: '#3a3f4b', dark: '#101218', deep: '#000000', light: '#aeb4c2', ring: '#101218' },
  { id: 8, name: 'Hồng',   base: '#ff6fae', dark: '#c23a7a', deep: '#8f2557', light: '#ffd2e6', ring: '#c23a7a' },
  { id: 9, name: 'Xanh nhạt', base: '#4fc3f7', dark: '#1d86c1', deep: '#125e88', light: '#c8ecff', ring: '#1d86c1' },
  { id: 10, name: 'Xanh ngọc', base: '#14b8a6', dark: '#0a6e63', deep: '#064e46', light: '#a7f3ea', ring: '#0a6e63' },
  { id: 11, name: 'Xanh cốm', base: '#a3e635', dark: '#4d7c0f', deep: '#33530a', light: '#e3f8b8', ring: '#4d7c0f' },
];

export const colorById = (id: number): BallColor => BALL_COLORS[id % BALL_COLORS.length];
