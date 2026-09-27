import { useEffect, useMemo, useState } from 'react';
import { MenuScreen } from './components/MenuScreen';
import { LevelSelect } from './components/LevelSelect';
import { GameScreen } from './components/GameScreen';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { getCoins, getLanguage, getMusicPref, getSoundPref, getStars, getUnlocked, setLanguage, setMusicPref, setSoundPref, type Language } from './game/storage';
import { setMusicOn, setSoundOn, startMusic } from './game/audio';

import { CardsScreen } from './components/CardsScreen';

type Screen = 'menu' | 'levels' | 'game' | 'cards';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [level, setLevel] = useState(getUnlocked());
  const [runId, setRunId] = useState(0);
  const [unlocked, setUnlockedState] = useState(getUnlocked());
  const [stars, setStarsState] = useState(getStars());
  const [sound, setSound] = useState(getSoundPref());
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [language, changeLanguage] = useState<Language>(getLanguage());
  const [music, setMusic] = useState(getMusicPref());
  const [coins, setCoins] = useState(getCoins());

  useEffect(() => {
    setSoundOn(sound);
    setSoundPref(sound);
  }, [sound]);
  useEffect(() => { setMusicOn(music); setMusicPref(music); if (music) startMusic(); }, [music]);
  useEffect(() => { document.documentElement.lang = language; setLanguage(language); }, [language]);
  useEffect(() => {
    const activate = () => { if (music) startMusic(); };
    window.addEventListener('pointerdown', activate);
    return () => window.removeEventListener('pointerdown', activate);
  }, [music]);

  const refreshProgress = () => {
    setUnlockedState(getUnlocked());
    setStarsState(getStars());
    setCoins(getCoins());
  };

  const totalStars = useMemo(() => Object.values(stars).reduce((a, b) => a + b, 0), [stars]);

  const startLevel = (lv: number) => {
    setLevel(lv);
    setScreen('game');
  };

  return (
    <div
      className="flex min-h-dvh items-center justify-center sm:p-4"
      style={{
        background: 'radial-gradient(1200px 800px at 50% -10%, #1d5c3a 0%, #0b2417 55%, #05130c 100%)',
      }}
    >
      {/* khung điện thoại 9:16 */}
      <div className="relative h-dvh w-full max-w-[430px] overflow-hidden bg-sky-200 sm:h-[min(900px,94dvh)] sm:rounded-[2.2rem] sm:border-[7px] sm:border-[#07170f] sm:shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        {/* tai thỏ trang trí (desktop) */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-[60] hidden h-6 w-32 -translate-x-1/2 rounded-full bg-[#07170f] sm:block" />

        {screen === 'menu' && (
          <MenuScreen
            currentLevel={unlocked}
            totalStars={totalStars}
            coins={coins}
            language={language}
            onSettings={() => setShowSettings(true)}
            onPlay={() => startLevel(unlocked)}
            onLevels={() => { refreshProgress(); setScreen('levels'); }}
            onCards={() => setScreen('cards')}
            onHelp={() => setShowHelp(true)}
          />
        )}

        {screen === 'cards' && (
          <CardsScreen language={language} unlocked={unlocked} onBack={() => setScreen('menu')} />
        )}

        {screen === 'levels' && (
          <LevelSelect
            unlocked={unlocked}
            stars={stars}
            language={language}
            onBack={() => setScreen('menu')}
            onPick={(lv) => startLevel(lv)}
          />
        )}

        {screen === 'game' && (
          <GameScreen
            key={`${level}-${runId}`}
            level={level}
            coins={coins}
            language={language}
            onCoinsChange={() => setCoins(getCoins())}
            onSettings={() => setShowSettings(true)}
            onExit={() => { refreshProgress(); setScreen('menu'); }}
            onLevelChange={(lv) => {
              refreshProgress();
              if (lv === level) setRunId((r) => r + 1);
              else setLevel(lv);
            }}
          />
        )}

        {showHelp && <HelpModal language={language} onClose={() => setShowHelp(false)} />}
        {showSettings && <SettingsModal language={language} sound={sound} music={music} coins={coins} onLanguage={changeLanguage} onSound={() => setSound(!sound)} onMusic={() => setMusic(!music)} onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
}
