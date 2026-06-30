import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const ANIME_ART = 'https://cdn.poehali.dev/projects/a5636f52-1afb-4e11-a672-22eb126baf64/files/d39b06c6-1b2a-4244-b2af-e87e488b6e0c.jpg';

interface Track { id: number; title: string; artist: string; url: string; }
interface Playlist { id: number; name: string; tracks: Track[]; }

const fmtTime = (s: number) => {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// Треки — Internet Archive, точные имена файлов (Public Domain / CC0)
const IA = 'https://archive.org/download';
const ALL_TRACKS: Track[] = [
  // DWK312 — Centz "Lo-Fi Library" (Dusted Wax Kingdom, free download)
  { id: 1,  title: 'Bonjour',              artist: 'Centz', url: `${IA}/DWK312/Centz_-_01_-_Bonjour.mp3` },
  { id: 2,  title: 'Mask Collection',      artist: 'Centz', url: `${IA}/DWK312/Centz_-_02_-_Mask_Collection.mp3` },
  { id: 3,  title: 'London Underground',   artist: 'Centz', url: `${IA}/DWK312/Centz_-_03_-_The_London_Underground.mp3` },
  { id: 4,  title: 'Go Home With You',     artist: 'Centz', url: `${IA}/DWK312/Centz_-_04_-_Go_Home_With_You.mp3` },
  { id: 5,  title: 'Submarine Air-Force',  artist: 'Centz', url: `${IA}/DWK312/Centz_-_05_-_Submarine_Air-Force.mp3` },
  { id: 6,  title: '1990',                 artist: 'Centz', url: `${IA}/DWK312/Centz_-_06_-_1990.mp3` },
  { id: 7,  title: 'Samurai Disco',        artist: 'Centz', url: `${IA}/DWK312/Centz_-_07_-_Samurai_Disco.mp3` },
  { id: 8,  title: 'She Left',             artist: 'Centz', url: `${IA}/DWK312/Centz_-_08_-_She_Left.mp3` },
  { id: 9,  title: 'Rains',                artist: 'Centz', url: `${IA}/DWK312/Centz_-_09_-_Rains.mp3` },
  { id: 10, title: 'Midnight Rider',       artist: 'Centz', url: `${IA}/DWK312/Centz_-_10_-_Midnight_Rider.mp3` },
  { id: 11, title: 'Balcony',              artist: 'Centz', url: `${IA}/DWK312/Centz_-_11_-_Balcony.mp3` },
  { id: 12, title: 'Last Train',           artist: 'Centz', url: `${IA}/DWK312/Centz_-_12_-_Last_Train.mp3` },
  { id: 13, title: 'Afterwork',            artist: 'Centz', url: `${IA}/DWK312/Centz_-_13_-_Afterwork.mp3` },
  { id: 14, title: 'Neon Noir',            artist: 'Centz', url: `${IA}/DWK312/Centz_-_14_-_Neon_Noir.mp3` },
  // kalaido-hanging-lanterns_202101 — Free Lofi compilation
  { id: 15, title: 'Lo-Fi Type Beat Rain', artist: 'Free Beat',  url: `${IA}/kalaido-hanging-lanterns_202101/%28FREE%29%20Lo-fi%20Type%20Beat%20-%20Rain.mp3` },
  { id: 16, title: 'Deep Space',           artist: 'Free Beat',  url: `${IA}/kalaido-hanging-lanterns_202101/deep%20space%20-%20Ambient%20Lofi%20Hip%20Hop%20Beat%20%28FREE%20FOR%20PROFIT%20USE%29.mp3` },
  { id: 17, title: 'Defective',            artist: 'Free Beat',  url: `${IA}/kalaido-hanging-lanterns_202101/defective%20-%20LofiTrap%20Style%20Hip%20Hop%20Beat%20%28FREE%20FOR%20PROFIT%20USE%29.mp3` },
  { id: 18, title: 'Finite',              artist: 'Free Beat',   url: `${IA}/kalaido-hanging-lanterns_202101/finite%20-%20Lofi%20Hip%20Hop%20Beat%20%28FREE%20FOR%20PROFIT%20USE%29.mp3` },
  { id: 19, title: 'Tranquillity',         artist: 'Free Beat',  url: `${IA}/kalaido-hanging-lanterns_202101/Tranquillity%20-%20Chill%20Lofi%20Hip%20Hop%20Beat%20%28FREE%20FOR%20PROFIT%20USE%29.mp3` },
  { id: 20, title: 'Rainy Night',          artist: 'Free Beat',  url: `${IA}/kalaido-hanging-lanterns_202101/rainy%20night%20-%20Lo-fi%20Hip%20Hop%20Beat%20%28FREE%20FOR%20PROFIT%20USE%29.mp3` },
];

const initialPlaylists: Playlist[] = [
  { id: 1, name: 'NEON NIGHTS',  tracks: ALL_TRACKS.slice(0, 7) },
  { id: 2, name: 'CHILL SECTOR', tracks: ALL_TRACKS.slice(7, 14) },
  { id: 3, name: 'ALL TRACKS',   tracks: ALL_TRACKS },
];

// Heights for 32 equalizer bars (static pattern, animated via CSS)
const BAR_HEIGHTS = Array.from({ length: 32 }, (_, i) =>
  20 + Math.abs(Math.sin(i * 0.9 + 1)) * 75
);

export default function Index() {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [activePlaylistId, setActivePlaylistId] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [editingDonate, setEditingDonate] = useState(false);
  const [donateInput, setDonateInput] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)!;
  const currentTrack = activePlaylist.tracks[currentTrackIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      if (audio.dataset.repeat === 'true') {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      window.dispatchEvent(new Event('audio-next'));
    });
    // Если трек не загрузился — пропускаем
    audio.addEventListener('error', () => {
      console.warn('Track failed, skipping...');
      window.dispatchEvent(new Event('audio-next'));
    });

    return () => { audio.pause(); audio.src = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep repeat flag in sync without recreating audio
  useEffect(() => {
    if (audioRef.current) audioRef.current.dataset.repeat = String(repeat);
  }, [repeat]);

  // Keep volume in sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const pickNext = useCallback((idx: number, tracks: Track[]) => {
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && r === idx) r = (r + 1) % tracks.length;
      return r;
    }
    return (idx + 1) % tracks.length;
  }, [shuffle]);

  // Listen for auto-next
  useEffect(() => {
    const onNext = () => {
      setCurrentTrackIndex((i) => pickNext(i, activePlaylist.tracks));
      setCurrentTime(0);
    };
    window.addEventListener('audio-next', onNext);
    return () => window.removeEventListener('audio-next', onNext);
  }, [pickNext, activePlaylist.tracks]);

  // Load & play when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.pause();
    audio.src = currentTrack.url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) {
      audio.addEventListener('canplay', () => audio.play(), { once: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, activePlaylistId]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && currentTrack) {
        audio.src = currentTrack.url;
        audio.load();
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((i) => pickNext(i, activePlaylist.tracks));
    setCurrentTime(0);
  };
  const handlePrev = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0; return;
    }
    setCurrentTrackIndex((i) => (i - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length);
    setCurrentTime(0);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  };

  const selectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    setCurrentTime(0);
    setIsPlaying(true);
    // Delayed to let state settle
    setTimeout(() => audioRef.current?.play(), 50);
  };

  const selectPlaylist = (id: number) => {
    setActivePlaylistId(id);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const addPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const p: Playlist = { id: Date.now(), name: newPlaylistName.toUpperCase(), tracks: [] };
    setPlaylists((prev) => [...prev, p]);
    setNewPlaylistName(''); setCreatingPlaylist(false);
    selectPlaylist(p.id);
  };

  const saveDonate = () => {
    const v = donateInput.trim();
    setDonateUrl(v ? (v.startsWith('http') ? v : `https://${v}`) : '');
    setEditingDonate(false);
  };

  return (
    <div className="min-h-screen cyber-grid relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-8 gap-4 flex-wrap animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass neon-border-pink flex items-center justify-center">
              <Icon name="AudioLines" className="text-neon-pink" size={22} />
            </div>
            <h1 className="font-display font-black text-2xl tracking-widest neon-text-cyan text-neon-cyan">
              NEON<span className="text-neon-pink neon-text-pink">LOFI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {editingDonate ? (
              <div className="flex gap-2 animate-fade-in">
                <input
                  autoFocus value={donateInput}
                  onChange={(e) => setDonateInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveDonate()}
                  placeholder="https://donate-link.com"
                  className="bg-background/40 border border-neon-cyan/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none w-56"
                />
                <button onClick={saveDonate} className="px-3 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                  <Icon name="Check" size={16} />
                </button>
                <button onClick={() => setEditingDonate(false)} className="px-3 rounded-lg glass text-foreground/50">
                  <Icon name="X" size={16} />
                </button>
              </div>
            ) : (
              <>
                {donateUrl && (
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neon-pink/20 text-neon-pink border border-neon-pink/40 hover:bg-neon-pink/30 transition-all font-display text-xs tracking-wider">
                    <Icon name="Heart" size={14} /> DONATE
                  </a>
                )}
                <button
                  onClick={() => { setDonateInput(donateUrl); setEditingDonate(true); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-foreground/20 text-foreground/60 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all text-xs font-display tracking-wider"
                >
                  <Icon name="Link" size={14} />
                  {donateUrl ? 'EDIT LINK' : 'ADD DONATE'}
                </button>
              </>
            )}
            <span className="font-display text-xs tracking-[0.3em] text-neon-cyan/60 hidden md:block">// 2099</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* PLAYER */}
          <section className="lg:col-span-3 glass rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>

            {/* Vinyl */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-72 h-72 rounded-full bg-neon-purple/10 blur-2xl animate-pulse-glow" />
              <div
                className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-neon-pink/40 neon-border-pink select-none"
                style={{ animation: isPlaying ? 'spin-slow 8s linear infinite' : 'none' }}
              >
                <img src={ANIME_ART} alt="cover" className="w-full h-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/30 via-transparent to-neon-cyan/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-background/90 border-2 border-neon-cyan/60 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-neon-cyan" />
                  </div>
                </div>
              </div>
            </div>

            {/* Track info */}
            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-xl text-foreground tracking-wide mb-1 truncate">
                {currentTrack?.title || 'NO TRACK'}
              </h2>
              <p className="text-neon-cyan/70 text-sm tracking-wide">{currentTrack?.artist || '—'}</p>
            </div>

            {/* Equalizer */}
            <div className="flex items-end justify-center gap-[3px] h-10 mb-6">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-neon-pink to-neon-cyan"
                  style={{
                    height: `${h}%`,
                    opacity: isPlaying ? 0.9 : 0.2,
                    animation: isPlaying ? `pulse-glow ${0.5 + (i % 7) * 0.12}s ease-in-out infinite alternate` : 'none',
                    transformOrigin: 'bottom',
                    transform: isPlaying ? `scaleY(${0.4 + Math.random() * 0.6})` : 'scaleY(0.25)',
                    transition: 'opacity 0.3s',
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div
                className="h-2 rounded-full bg-foreground/10 cursor-pointer relative overflow-visible"
                onClick={seek}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan relative transition-none"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg"
                    style={{ boxShadow: '0 0 8px hsl(var(--neon-cyan))' }} />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-foreground/40 font-display">
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 mb-6">
              <button onClick={() => setShuffle((s) => !s)} title="Shuffle"
                className={`transition-all ${shuffle ? 'text-neon-cyan scale-110' : 'text-foreground/40 hover:text-foreground/70'}`}>
                <Icon name="Shuffle" size={20} />
              </button>
              <button onClick={handlePrev} className="text-foreground/70 hover:text-neon-cyan transition-colors">
                <Icon name="SkipBack" size={28} />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center hover:scale-105 transition-transform"
                style={{ boxShadow: '0 0 20px hsl(var(--neon-pink) / 0.5)' }}
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} className="text-white" />
              </button>
              <button onClick={handleNext} className="text-foreground/70 hover:text-neon-cyan transition-colors">
                <Icon name="SkipForward" size={28} />
              </button>
              <button onClick={() => setRepeat((r) => !r)} title="Repeat"
                className={`transition-all ${repeat ? 'text-neon-pink scale-110' : 'text-foreground/40 hover:text-foreground/70'}`}>
                <Icon name="Repeat" size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <Icon name="Volume2" size={18} className="text-neon-cyan/70" />
              <input type="range" min={0} max={100} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 cursor-pointer h-1"
                style={{ accentColor: 'hsl(var(--neon-cyan))' }}
              />
              <span className="text-xs text-neon-cyan/60 w-8 font-display">{volume}</span>
            </div>
          </section>

          {/* PLAYLISTS */}
          <section className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm tracking-widest text-neon-cyan">PLAYLISTS</h3>
              <button onClick={() => setCreatingPlaylist((v) => !v)} className="text-neon-pink hover:scale-110 transition-transform">
                <Icon name="Plus" size={20} />
              </button>
            </div>

            {creatingPlaylist && (
              <div className="flex gap-2 mb-4">
                <input autoFocus value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlaylist()}
                  placeholder="Playlist name..."
                  className="flex-1 bg-background/40 border border-neon-cyan/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
                <button onClick={addPlaylist}
                  className="px-3 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors">
                  <Icon name="Check" size={18} />
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-5 flex-wrap">
              {playlists.map((p) => (
                <button key={p.id} onClick={() => selectPlaylist(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-wider transition-all ${
                    p.id === activePlaylistId
                      ? 'bg-neon-pink/20 text-neon-pink neon-border-pink'
                      : 'bg-background/30 text-foreground/50 border border-foreground/10 hover:text-foreground'
                  }`}>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '380px' }}>
              {activePlaylist.tracks.length === 0 && (
                <p className="text-center text-foreground/40 text-sm py-8">Playlist is empty</p>
              )}
              {activePlaylist.tracks.map((t, idx) => {
                const active = idx === currentTrackIndex;
                return (
                  <button key={t.id} onClick={() => selectTrack(idx)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      active ? 'bg-neon-cyan/10 neon-border-cyan' : 'hover:bg-foreground/5'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-display text-xs
                      ${active ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-foreground/10 text-foreground/40'}`}>
                      {active && isPlaying
                        ? <Icon name="AudioLines" size={14} className="text-neon-cyan" />
                        : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${active ? 'text-neon-cyan' : 'text-foreground/90'}`}>{t.title}</p>
                      <p className="text-xs text-foreground/40 truncate">{t.artist}</p>
                    </div>
                    {active && isPlaying && (
                      <div className="flex items-end gap-[2px] h-4 shrink-0">
                        {[1,2,3].map((b) => (
                          <div key={b} className="w-1 rounded-full bg-neon-cyan"
                            style={{ height: '60%', animation: `pulse-glow ${0.5 + b * 0.2}s ease-in-out infinite alternate` }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="text-center mt-8 text-foreground/30 text-xs tracking-[0.2em] font-display">
          NEONLOFI © 2099 — RELAX IN THE NEON CITY
        </footer>
      </div>
    </div>
  );
}