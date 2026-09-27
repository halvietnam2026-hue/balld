import { memo } from 'react';
import { colorById } from '../game/colors';

interface Props {
  color: number;
  size: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

/** Quả bóng bóng căng — giống ảnh mẫu: tròn căng, highlight trắng góc trên-trái */
export const Ball = memo(function Ball({ color, size, glow, style }: Props) {
  const c = colorById(color);
  const s = size;
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: s,
        height: s,
        background: `radial-gradient(circle at 32% 26%, ${c.light} 0%, ${c.base} 26%, ${c.base} 52%, ${c.dark} 78%, ${c.deep} 100%)`,
        boxShadow: glow
          ? `0 6px 14px rgba(0,0,0,.35), inset -3px -5px 8px rgba(0,0,0,.35), inset 2px 3px 5px rgba(255,255,255,.45), 0 0 18px ${c.base}66`
          : `0 4px 8px rgba(0,0,0,.30), inset -${s * 0.08}px -${s * 0.12}px ${s * 0.16}px rgba(0,0,0,.35), inset ${s * 0.05}px ${s * 0.07}px ${s * 0.1}px rgba(255,255,255,.5)`,
        border: `1px solid ${c.dark}`,
        ...style,
      }}
    >
      {/* highlight chính: vệt bóng trắng bầu dục */}
      <div
        className="absolute rounded-full"
        style={{
          left: s * 0.14,
          top: s * 0.08,
          width: s * 0.44,
          height: s * 0.3,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,.95) 0%, rgba(255,255,255,.55) 45%, rgba(255,255,255,0) 72%)',
          transform: 'rotate(-18deg)',
          filter: 'blur(0.4px)',
        }}
      />
      {/* chấm sáng nhỏ */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          left: s * 0.2,
          top: s * 0.38,
          width: Math.max(3, s * 0.09),
          height: Math.max(3, s * 0.09),
          opacity: 0.9,
          boxShadow: '0 0 4px rgba(255,255,255,.9)',
        }}
      />
      {/* phản chiếu đáy */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: s * 0.06,
          width: s * 0.5,
          height: s * 0.14,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </div>
  );
});
