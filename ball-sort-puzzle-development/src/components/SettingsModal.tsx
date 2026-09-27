import { Coins, Disc3, Globe2, Music2, Volume2, X } from 'lucide-react';
import type { Language } from '../game/storage';
import { text } from '../game/i18n';

interface Props {
  language: Language;
  sound: boolean;
  music: boolean;
  coins: number;
  onLanguage: (language: Language) => void;
  onSound: () => void;
  onMusic: () => void;
  onClose: () => void;
}

export function SettingsModal({ language, sound, music, coins, onLanguage, onSound, onMusic, onClose }: Props) {
  const t = text(language);
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-[#07130d]/70 px-5 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-[360px] animate-[winPop_.35s_ease-out] rounded-[28px] border border-white/20 bg-[#172b28] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-black tracking-[.3em] text-amber-300">BALL SORT</p><h2 className="font-display text-[29px] font-black">{t.settings}</h2></div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-white/10"><X size={20} /></button>
        </div>
        <div className="mt-5 flex items-center justify-between border-b border-white/15 pb-4">
          <span className="flex items-center gap-3 font-bold"><Globe2 size={19} className="text-amber-300" />{t.lang}</span>
          <div className="flex rounded-full bg-black/30 p-1 text-xs font-extrabold">
            {(['en', 'vi'] as const).map((l) => <button key={l} onClick={() => onLanguage(l)} className={`rounded-full px-3 py-1.5 transition ${language === l ? 'bg-amber-400 text-[#14251e]' : 'text-white/55'}`}>{l === 'en' ? 'English' : 'Tiếng Việt'}</button>)}
          </div>
        </div>
        <SettingSwitch icon={<Volume2 size={19} />} label={t.sound} value={sound} onClick={onSound} />
        <SettingSwitch icon={<Music2 size={19} />} label={t.music} value={music} onClick={onMusic} />
        <p className="-mt-2 mb-3 pl-8 text-xs text-white/45">{t.musicDesc}</p>
        <div className="flex items-center justify-between border-t border-white/15 py-4 font-bold"><span className="flex items-center gap-3"><Coins size={19} className="text-amber-300" />{t.coins}</span><span className="text-amber-300">{coins.toLocaleString()}</span></div>
        <div className="border-t border-white/15 pt-4">
          <p className="mb-3 text-[10px] font-black tracking-[.22em] text-white/45">{t.community}</p>
          <button onClick={() => { void navigator.clipboard?.writeText('Hal_2105'); }} title="Copy Discord username" className="flex w-full items-center gap-2 rounded-xl bg-[#344657] p-3 text-left text-xs font-bold"><Disc3 size={18} /> Discord <span className="ml-auto text-white/75">Hal_2105</span></button>
          <a href="https://www.roblox.com/search/users?keyword=Hal_2105" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 rounded-xl bg-[#344657] p-3 text-xs font-bold"><span className="grid size-[18px] rotate-45 place-items-center rounded-[4px] bg-white"><span className="size-1.5 bg-[#344657]" /></span> Roblox <span className="ml-auto text-white/75">Hal_2105</span></a>
        </div>
      </div>
    </div>
  );
}

function SettingSwitch({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between py-3 font-bold"><span className="flex items-center gap-3">{icon}{label}</span><button onClick={onClick} aria-label={label} aria-pressed={value} className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-amber-400' : 'bg-white/20'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-1'}`} /></button></div>;
}