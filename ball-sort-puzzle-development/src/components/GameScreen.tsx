import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Lightbulb, TestTube2, Settings2, Trophy, Home, ChevronRight, Star, Coins, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ball } from './Ball';
import { Tube } from './Tube';
import { CAPACITY, applyMove, canMove, cloneTubes, completedCount, findHint, hasAnyMove, isTubeComplete, isWin, movableCount, type Tubes } from '../game/logic';
import { generateLevel, parMoves, starsFor } from '../game/levels';
import { sfx } from '../game/audio';
import { addCard, rewardLevel, setBest, setStar, setUnlocked, type Language } from '../game/storage';
import { text } from '../game/i18n';
import { drawCard, rarityInfo, type MilitaryCard } from '../game/cards';
import { MAX_LEVEL, islandForLevel, stageInIsland } from '../game/islands';
import { CardView } from './CardView';

interface Props {
  level: number;
  coins: number;
  language: Language;
  onCoinsChange: () => void;
  onSettings: () => void;
  onExit: () => void;
  onLevelChange: (lv: number) => void;
}

interface Flight {
  id: number;
  color: number;
  to: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  delay: number;
}

function ballSizeFor(count: number) {
  if (count <= 3) return 50;
  if (count <= 5) return 45;
  if (count <= 7) return 41;
  if (count <= 9) return 37;
  if (count <= 11) return 33;
  if (count <= 13) return 30;
  return 28;
}

function FlyingBall({ flight, size, onFinish }: { flight: Flight; size: number; onFinish: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dx = flight.end.x - flight.start.x;
    const dy = flight.end.y - flight.start.y;
    const rise = Math.min(-45, dy - 52);
    const animation = el.animate([
      { transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)' },
      { transform: `translate(-50%, -50%) translate(${dx * .35}px, ${rise}px) scale(1.08)`, offset: .38 },
      { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(.97)` },
    ], { duration: 360, delay: flight.delay, easing: 'cubic-bezier(.28,.12,.27,1)', fill: 'forwards' });
    animation.onfinish = () => onFinish(flight.id);
    return () => { animation.onfinish = null; animation.cancel(); };
  }, [flight, onFinish]);
  return <div ref={ref} className="pointer-events-none absolute z-40" style={{ left: flight.start.x, top: flight.start.y }}><Ball color={flight.color} size={size} glow /></div>;
}

export function GameScreen({ level, coins, language, onCoinsChange, onSettings, onExit, onLevelChange }: Props) {
  const t = text(language);
  const data = useMemo(() => generateLevel(level), [level]);
  const [tubes, setTubes] = useState<Tubes>(() => cloneTubes(data.tubes));
  const tubesRef = useRef<Tubes>(cloneTubes(data.tubes));
  const [selected, setSelected] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const movesRef = useRef(0);
  const [shaking, setShaking] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [extraUsed, setExtraUsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const wonRef = useRef(false);
  const [stars, setStars] = useState<1 | 2 | 3>(3);
  const [earned, setEarned] = useState(0);
  const [reward_card, setRewardCard] = useState<{ card: MilitaryCard; count: number } | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const island = islandForLevel(level);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const nextFlightId = useRef(0);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ballSize = ballSizeFor(tubes.length);
  const done = completedCount(tubes);
  const reward = 2;

  useEffect(() => () => {
    if (winTimer.current) clearTimeout(winTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  }, []);

  const select = (index: number | null) => { selectedRef.current = index; setSelected(index); };

  const center = (index: number, slot?: number) => {
    const board = boardRef.current?.getBoundingClientRect();
    const tube = wrapRefs.current[index]?.getBoundingClientRect();
    if (!board || !tube) return { x: 0, y: 0 };
    const x = tube.left + tube.width / 2 - board.left;
    if (slot === undefined) return { x, y: tube.top + ballSize * .5 - board.top };
    return { x, y: tube.bottom - 6 - ballSize / 2 - slot * (ballSize + Math.max(2, ballSize * .06)) - board.top };
  };

  const finishFlight = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
    sfx.drop();
  }, []);

  const move = (from: number, to: number) => {
    const current = tubesRef.current;
    const count = movableCount(current, from, to);
    if (!count) return;
    const color = current[from][current[from].length - 1];
    const destLength = current[to].length;
    const start = center(from);
    const created: Flight[] = Array.from({ length: count }, (_, i) => ({
      id: ++nextFlightId.current, color, to, start,
      end: center(to, destLength + i), delay: i * 65,
    }));

    // Commit the stack immediately. Animation is purely visual, so new taps
    // can be processed while earlier balls are still in flight.
    const next = applyMove(current, from, to).next;
    tubesRef.current = next;
    setTubes(next);
    setFlights((f) => [...f, ...created]);
    select(null);
    setHint(null);
    movesRef.current++;
    sfx.pick();

    const finished = isTubeComplete(next[to]) && next[to].length === CAPACITY && !isTubeComplete(current[to]);
    if (finished) {
      sfx.complete();
      confetti({ particleCount: 28, spread: 65, origin: { y: .56 }, disableForReducedMotion: true });
    }
    if (isWin(next) && !wonRef.current) {
      wonRef.current = true;
      const st = starsFor(movesRef.current, parMoves(level, data.config.colors));
      setStars(st);
      setStar(level, st);
      setBest(level, movesRef.current);
      setUnlocked(level + 1);
      const paid = rewardLevel(level, reward);
      setEarned(paid);
      // Lần thắng đầu tiên của màn → nhận 1 thẻ ngẫu nhiên
      if (paid > 0) {
        const card = drawCard(level);
        const count = addCard(card.id);
        setRewardCard({ card, count });
        setCardRevealed(false);
      } else {
        setRewardCard(null);
      }
      onCoinsChange();
      winTimer.current = setTimeout(() => {
        setWon(true);
        sfx.win();
        confetti({ particleCount: 140, spread: 100, origin: { y: .5 }, disableForReducedMotion: true });
      }, 450 + (count - 1) * 65);
    } else if (!hasAnyMove(next)) {
      notify(t.stuck);
      sfx.error();
    }
  };

  const pressTube = (index: number) => {
    if (wonRef.current) return;
    const current = tubesRef.current;
    const tube = current[index];
    const from = selectedRef.current;
    if (from !== null && from !== index && canMove(current, from, index)) {
      move(from, index);
      return;
    }
    if (tube.length === CAPACITY && isTubeComplete(tube)) {
      select(null); notify(t.solved); return;
    }
    if (from === index) { select(null); sfx.click(); return; }
    if (tube.length) {
      select(index); sfx.pick();
      if (from !== null) { setShaking(index); setTimeout(() => setShaking(null), 350); }
    } else if (from === null) {
      setShaking(index); setTimeout(() => setShaking(null), 350);
    } else {
      notify(tube.length >= CAPACITY ? t.full : t.mismatch);
      sfx.error();
    }
  };

  const restart = () => {
    if (winTimer.current) clearTimeout(winTimer.current);
    wonRef.current = false;
    const reset = cloneTubes(data.tubes);
    tubesRef.current = reset;
    setTubes(reset);
    setFlights([]);
    select(null); setHint(null); setExtraUsed(false); setWon(false);
    movesRef.current = 0;
    sfx.click(); notify(t.restarted);
  };

  const addTube = () => {
    if (extraUsed || wonRef.current) return;
    const next = [...tubesRef.current.map((tube) => [...tube]), []];
    tubesRef.current = next; setTubes(next);
    select(null); setExtraUsed(true); sfx.complete(); notify(t.added);
  };

  const useHint = () => {
    if (wonRef.current) return;
    const result = findHint(tubesRef.current);
    if (!result) { notify(t.noHint); return; }
    setHint(result); sfx.click();
    setTimeout(() => setHint(null), 2600);
  };

  return (
    <div className="dark-stage-bg relative flex h-full w-full flex-col overflow-hidden text-white">

      <div className="relative z-10 px-4 pt-5">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="min-w-0 flex-1 text-center"><p className="truncate text-[9px] font-black tracking-[.2em]" style={{ color: island.accent }}>{island.icon} {(language === 'vi' ? island.nameVi : island.name).toUpperCase()} · {stageInIsland(level)}/500</p><h1 className="font-display text-[25px] font-black leading-none">LEVEL {level.toLocaleString()}</h1></div>
          <div className="flex items-center gap-1 rounded-full border border-amber-300/35 bg-black/45 px-2.5 py-2 text-xs font-black text-amber-200 backdrop-blur-md"><Coins size={15} />{coins}</div>
          <button onClick={onSettings} className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/35 backdrop-blur-md" aria-label={t.settings}><Settings2 size={20} /></button>
        </div>
        <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-black tracking-wider text-white/85 backdrop-blur-md"><Sparkles size={13} className="text-amber-300" />{done} / {data.config.colors}</div>
      </div>

      <div ref={boardRef} className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-2 py-2">
        <div className="flex max-w-full flex-wrap items-end justify-center" style={{ columnGap: 6, rowGap: 4 }}>
          {tubes.map((balls, i) => {
            const incoming = flights.filter((f) => f.to === i).length;
            const visibleBalls = incoming ? balls.slice(0, -incoming) : balls;
            return <div key={i} ref={(el) => { wrapRefs.current[i] = el; }}><Tube balls={visibleBalls} ballSize={ballSize} selected={selected === i} hinted={!!hint && (hint[0] === i || hint[1] === i)} shaking={shaking === i} completed={balls.length === CAPACITY && isTubeComplete(balls) && incoming === 0} dimmed={selected !== null && selected !== i && !canMove(tubes, selected, i) && balls.length > 0} onPress={() => pressTube(i)} /></div>;
          })}
        </div>
        {flights.map((flight) => <FlyingBall key={flight.id} flight={flight} size={ballSize} onFinish={finishFlight} />)}
      </div>

      {toast && <div className="pointer-events-none absolute left-1/2 top-[35%] z-50 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-xs font-bold text-white shadow-xl backdrop-blur-md">{toast}</div>}

      <div className="relative z-10 px-4 pb-5">
        <div className="flex items-center justify-center gap-3">
          <ActionButton icon={<RotateCcw size={20} />} label={t.restart} onClick={restart} />
          <ActionButton icon={<TestTube2 size={20} />} label={extraUsed ? t.tubeUsed : t.extraTube} onClick={addTube} disabled={extraUsed} />
          <ActionButton icon={<Lightbulb size={20} />} label={t.hint} onClick={useHint} />
        </div>
        <button onClick={() => setShowHelp(true)} className="mx-auto mt-3 block text-[11px] font-bold text-white/65 underline underline-offset-4">{t.how}</button>
      </div>

      {showHelp && <div className="absolute inset-0 z-50 grid place-items-center bg-black/70 px-5 backdrop-blur-md" onClick={() => setShowHelp(false)}><div className="w-full rounded-[28px] border border-white/20 bg-[#172b28] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><h3 className="font-display text-2xl font-black">{t.how}</h3><div className="mt-4 space-y-3 text-sm text-white/80"><p>{t.help1}</p><p>{t.help2}</p><p>{t.help3}</p><p className="font-bold text-amber-300">{t.help4}</p></div><button onClick={() => setShowHelp(false)} className="mt-6 w-full rounded-xl bg-amber-400 py-3 font-black text-[#172b28]">{t.gotIt}</button></div></div>}

      {won && (
        <div className="absolute inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-[340px] animate-[winPop_.45s_cubic-bezier(.34,1.56,.64,1)] rounded-[30px] border border-amber-200/40 bg-[#1c3129] p-5 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <Trophy size={22} className="text-amber-300" />
              <h2 className="font-display text-[26px] font-black leading-none">{t.complete}</h2>
            </div>
            <p className="mt-1 text-[10px] font-black tracking-[.22em] text-amber-300">LEVEL {level.toLocaleString()} · {island.icon} {language === 'vi' ? island.nameVi : island.name}</p>
            <div className="mt-2 flex justify-center gap-1.5">
              {[1, 2, 3].map((i) => <Star key={i} size={30} className={i <= stars ? 'fill-amber-400 text-amber-300' : 'fill-white/10 text-white/20'} style={{ animation: i <= stars ? `starPop .5s ${i * .12}s backwards` : undefined }} />)}
            </div>

            {/* ── phần thưởng thẻ ── */}
            {reward_card && (
              <div className="relative mx-auto mt-3 flex h-[216px] items-center justify-center">
                {cardRevealed && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 size-[260px] rounded-full opacity-60"
                    style={{ background: `conic-gradient(from 0deg, transparent, ${rarityInfo(reward_card.card.rarity).glow}, transparent 30%, ${rarityInfo(reward_card.card.rarity).glow}, transparent 60%, ${rarityInfo(reward_card.card.rarity).glow}, transparent 90%)`, animation: 'raysSpin 6s linear infinite' }}
                  />
                )}
                {cardRevealed ? (
                  <div className="relative animate-[cardFlip_.6s_ease-out]">
                    <CardView card={reward_card.card} width={140} language={language} />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCardRevealed(true);
                      sfx.win();
                      const r = reward_card.card.rarity;
                      if (r !== 'N' && r !== 'R') confetti({ particleCount: r === 'LR' ? 220 : 110, spread: 110, origin: { y: .45 }, disableForReducedMotion: true });
                    }}
                    className="relative flex h-[210px] w-[140px] animate-[playPulse_1.4s_ease-in-out_infinite] flex-col items-center justify-center overflow-hidden rounded-[18px] border-4 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,.55)]"
                    style={{ background: 'repeating-linear-gradient(45deg,#1f3b2f 0 10px,#274a3b 10px 20px)' }}
                  >
                    <div className="pointer-events-none absolute inset-y-0 w-10 bg-white/25 blur-sm" style={{ animation: 'shineSweep 2.2s ease-in-out infinite' }} />
                    <span className="text-5xl">🎖️</span>
                    <span className="font-display mt-2 text-sm font-black text-amber-200">{t.tapReveal}</span>
                  </button>
                )}
              </div>
            )}
            {reward_card && cardRevealed && (
              <p className="mt-1 text-xs font-black" style={{ color: rarityInfo(reward_card.card.rarity).text }}>
                {reward_card.count === 1 ? `✨ ${t.newCard} ✨` : `${t.duplicate} ×${reward_card.count}`}
              </p>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-2">
              <p className="text-[10px] font-black tracking-[.14em] text-amber-200/70">{earned ? t.earned : t.alreadyEarned}</p>
              <p className="font-display flex items-center gap-1 text-2xl font-black text-amber-300"><Coins size={20} />+{earned}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={onExit} className="grid size-12 place-items-center rounded-xl bg-white/10" aria-label="Home"><Home size={20} /></button>
              <button onClick={() => onLevelChange(level)} className="grid size-12 place-items-center rounded-xl bg-white/10" aria-label={t.restart}><RotateCcw size={20} /></button>
              {level < MAX_LEVEL ? (
                <button
                  disabled={!!reward_card && !cardRevealed}
                  onClick={() => onLevelChange(level + 1)}
                  className="font-display flex h-12 flex-1 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-[#172b28] disabled:opacity-40"
                >
                  {t.next}<ChevronRight size={20} />
                </button>
              ) : (
                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-amber-400 px-2 text-[11px] font-black">👑 {t.campaignDone}</div>
              )}
            </div>
            {level < MAX_LEVEL && (
              <p className="mt-2 text-[11px] text-white/45">
                {level % 500 === 0 ? `🏝️ ${islandForLevel(level + 1).icon} ${language === 'vi' ? islandForLevel(level + 1).nameVi : islandForLevel(level + 1).name}!` : t.unlocked}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="flex min-w-[90px] flex-1 flex-col items-center gap-1 rounded-2xl border border-white/25 bg-[#10231e]/80 px-2 py-2.5 text-amber-200 shadow-lg backdrop-blur-md transition active:scale-95 disabled:opacity-40"><span>{icon}</span><span className="text-[11px] font-extrabold text-white">{label}</span></button>;
}