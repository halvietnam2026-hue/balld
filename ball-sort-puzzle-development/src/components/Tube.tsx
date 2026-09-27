import { memo } from 'react';
import { Ball } from './Ball';
import { CAPACITY } from '../game/logic';
import { colorById } from '../game/colors';

interface Props {
  balls: number[]; // bottom -> top
  selected: boolean;
  ballSize: number;
  hinted: boolean;
  shaking: boolean;
  completed: boolean;
  dimmed: boolean;
  onPress: () => void;
}

/** Ống nghiệm thủy tinh — bóng xếp từ đáy lên đỉnh */
export const Tube = memo(function Tube({
  balls, selected, ballSize, hinted, shaking, completed, dimmed, onPress,
}: Props) {
  const gap = Math.max(2, ballSize * 0.06);
  const padX = Math.max(4, ballSize * 0.12);
  const tubeW = ballSize + padX * 2;
  const innerH = CAPACITY * ballSize + (CAPACITY - 1) * gap + 10;
  const lift = ballSize * 0.95 + 14;
  const topColor = balls.length > 0 ? colorById(balls[balls.length - 1]) : null;

  return (
    <button
      onClick={onPress}
      className="relative flex flex-col items-center justify-end outline-none select-none"
      style={{
        width: tubeW + 18,
        height: innerH + lift + 8,
        opacity: dimmed ? 0.55 : 1,
        transition: 'opacity .2s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* vùng bóng bay lên khi được chọn */}
      <div className="relative" style={{ width: tubeW + 18, height: lift }}>
        {selected && balls.length > 0 && topColor && (
          <div
            className="absolute left-1/2 -translate-x-1/2 animate-[ballFloat_1.1s_ease-in-out_infinite]"
            style={{ bottom: -6 }}
          >
            <Ball color={balls[balls.length - 1]} size={ballSize} glow />
          </div>
        )}
        {/* vòng gợi ý trên miệng ống */}
        {hinted && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="animate-ping rounded-full"
              style={{ width: ballSize * 1.15, height: ballSize * 1.15, background: 'rgba(250,204,21,.35)' }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-yellow-300"
              style={{ width: ballSize * 1.15, height: ballSize * 1.15, boxShadow: '0 0 16px rgba(250,204,21,.8)' }}
            />
          </div>
        )}
      </div>

      {/* thân ống */}
      <div
        className={shaking ? 'animate-[tubeShake_.4s_ease-in-out]' : ''}
        style={{ width: tubeW, height: innerH, position: 'relative' }}
      >
        {/* bóng bên trong */}
        {balls.map((color, i) => {
          const isTop = i === balls.length - 1;
          if (selected && isTop) return null; // bóng đỉnh đang bay lên trên
          return (
            <div
              key={`${i}-${color}`}
              className="absolute left-1/2 -translate-x-1/2 animate-[ballPop_.22s_ease-out]"
              style={{ bottom: 6 + i * (ballSize + gap) }}
            >
              <Ball color={color} size={ballSize} />
            </div>
          );
        })}

        {/* lớp kính phủ */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: `10px 10px ${tubeW / 2}px ${tubeW / 2}px`,
            background: 'linear-gradient(105deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.10) 22%, rgba(255,255,255,.02) 50%, rgba(255,255,255,.14) 82%, rgba(255,255,255,.35) 100%)',
            boxShadow: completed
              ? `inset 0 0 0 2px rgba(255,255,255,.75), inset 0 -10px 18px rgba(0,0,0,.12), 0 0 22px ${topColor?.base}55, 0 6px 14px rgba(0,0,0,.18)`
              : 'inset 0 0 0 2px rgba(255,255,255,.65), inset 0 -10px 18px rgba(0,0,0,.10), 0 6px 14px rgba(0,0,0,.16)',
            border: '2px solid rgba(100,116,139,.45)',
            borderTopWidth: 2,
          }}
        />
        {/* vệt sáng dọc thân ống */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 5, top: 12, bottom: 18, width: Math.max(4, tubeW * 0.1),
            borderRadius: 99,
            background: 'linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.08))',
            opacity: 0.8,
          }}
        />
        {/* miệng ống */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            top: -7, width: tubeW + 8, height: 14, borderRadius: 99,
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 45%, #94a3b8 100%)',
            border: '2px solid rgba(100,116,139,.55)',
            boxShadow: '0 2px 5px rgba(0,0,0,.25)',
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            top: -4, width: tubeW - 6, height: 8, borderRadius: 99,
            background: balls.length >= CAPACITY ? 'rgba(15,23,42,.25)' : 'linear-gradient(180deg, rgba(15,23,42,.28), rgba(15,23,42,.08))',
            border: '1px solid rgba(100,116,139,.35)',
          }}
        />

        {/* tia lấp lánh khi hoàn thành */}
        {completed && (
          <>
            <div className="pointer-events-none absolute -top-2 -right-1 animate-[sparkle_1.4s_ease-in-out_infinite] text-lg">✨</div>
            <div className="pointer-events-none absolute top-1/3 -left-2 animate-[sparkle_1.4s_.5s_ease-in-out_infinite] text-sm">✨</div>
          </>
        )}
      </div>
    </button>
  );
});
