import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const ANIME_ART = 'https://cdn.poehali.dev/projects/a5636f52-1afb-4e11-a672-22eb126baf64/files/d39b06c6-1b2a-4244-b2af-e87e488b6e0c.jpg';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

const fmtTime = (s: number) => {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const ALL_TRACKS: Track[] = [
  { id: 1,  title: 'Lofi Study',          artist: 'FASSounds',        url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 2,  title: 'Good Night Lofi',     artist: 'FASSounds',        url: 'https://cdn.pixabay.com/audio/2023/07/30/audio_e0908e8569.mp3' },
  { id: 3,  title: 'Lofi Chill Vibes',    artist: 'BoDleasons',       url: 'https://cdn.pixabay.com/audio/2024/11/04/audio_1d2b1cd3d2.mp3' },
  { id: 4,  title: 'Coffee Morning',      artist: 'Music_Unlimited',  url: 'https://cdn.pixabay.com/audio/2023/09/05/audio_a89e62b8f0.mp3' },
  { id: 5,  title: 'Lofi Background',     artist: 'Coma-Media',       url: 'https://cdn.pixabay.com/audio/2023/06/11/audio_8ae8e9b2c0.mp3' },
  { id: 6,  title: 'Rainy Lofi City',     artist: 'BoDleasons',       url: 'https://cdn.pixabay.com/audio/2023/04/13/audio_c610232c4e.mp3' },
  { id: 7,  title: 'Chill Lofi Beat',     artist: 'Music_For_Videos', url: 'https://cdn.pixabay.com/audio/2024/02/21/audio_e4d3a09b3a.mp3' },
  { id: 8,  title: 'Sunset Dreamer',      artist: 'Lofi_Vibes',       url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946e94a8ac.mp3' },
  { id: 9,  title: 'Midnight Jazz',       artist: 'CalmBeats',        url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_fbc5e02b44.mp3' },
  { id: 10, title: 'Tokyo Drift',         artist: 'SynthWave',        url: 'https://cdn.pixabay.com/audio/2023/01/12/audio_4efb72e5c3.mp3' },
  { id: 11, title: 'Neon Rain',           artist: 'CyberpunkBeats',   url: 'https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3' },
  { id: 12, title: 'Slow Motion',         artist: 'ChillHopStudio',   url: 'https://cdn.pixabay.com/audio/2023/03/09/audio_c62a4ca0b4.mp3' },
  { id: 13, title: 'Urban Nights',        artist: 'Lofi_Dreams',      url: 'https://cdn.pixabay.com/audio/2022/12/12/audio_ef9a1c3ed5.mp3' },
  { id: 14, title: 'Cloud Hopping',       artist: 'SoftBeats',        url: 'https://cdn.pixabay.com/audio/2023/02/28/audio_2c8740e5e1.mp3' },
  { id: 15, title: 'Pixel Garden',        artist: 'RetroWave',        url: 'https://cdn.pixabay.com/audio/2024/01/15/audio_9bcb8ac3a0.mp3' },
  { id: 16, title: 'Late Shift',          artist: 'FASSounds',        url: 'https://cdn.pixabay.com/audio/2022/09/14/audio_e86c5c4b73.mp3' },
  { id: 17, title: 'Dreaming in 8bit',    artist: 'PixelMelody',      url: 'https://cdn.pixabay.com/audio/2023/05/22/audio_3d06b6b3db.mp3' },
  { id: 18, title: 'Cozy Corner',         artist: 'ChillHopStudio',   url: 'https://cdn.pixabay.com/audio/2024/03/08/audio_0e3acb88be.mp3' },
  { id: 19, title: 'Ghost Signal',        artist: 'SynthWave',        url: 'https://cdn.pixabay.com/audio/2022/07/19/audio_66afb44a40.mp3' },
  { id: 20, title: 'Soft Sunrise',        artist: 'Coma-Media',       url: 'https://cdn.pixabay.com/audio/2023/08/17/audio_1bfb5c97aa.mp3' },
];

const initialPlaylists: Playlist[] = [
  { id: 1, name: 'NEON NIGHTS',   tracks: ALL_TRACKS.slice(0, 7) },
  { id: 2, name: 'CHILL SECTOR',  tracks: ALL_TRACKS.slice(7, 14) },
  { id: 3, name: 'ALL TRACKS',    tracks: ALL_TRACKS },
];

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [activePlaylistId, setActivePlaylistId] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [editingDonate, setEditingDonate] = useState(false);
  const [donateInput, setDonateInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)!;
  const currentTrack = activePlaylist.tracks[currentTrackIndex];

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // When track changes — load & play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.load();
    if (isPlaying) {
      const tryPlay = () => audio.play().catch(() => {});
      audio.addEventListener('canplay', tryPlay, { once: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, activePlaylistId]);

  // Toggle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const pickNext = useCallback((currentIdx: number, tracks: Track[]) => {
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && r === currentIdx) r = (r + 1) % tracks.length;
      return r;
    }
    return (currentIdx + 1) % tracks.length;
  }, [shuffle]);

  const handleEnded = useCallback(() => {
    if (repeat) {
      audioRef.current?.play().catch(() => {});
      return;
    }
    setCurrentTrackIndex((i) => pickNext(i, activePlaylist.tracks));
    setProgress(0);
    setCurrentTime(0);
  }, [repeat, pickNext, activePlaylist.tracks]);

  const handleNext = () => {
    setCurrentTrackIndex((i) => pickNext(i, activePlaylist.tracks));
    setProgress(0); setCurrentTime(0);
  };
  const handlePrev = () => {
    setCurrentTrackIndex((i) => (i - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length);
    setProgress(0); setCurrentTime(0);
  };

  const selectPlaylist = (id: number) => {
    setActivePlaylistId(id);
    setCurrentTrackIndex(0);
    setProgress(0); setCurrentTime(0);
    setIsPlaying(false);
  };

  const addPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newP: Playlist = { id: Date.now(), name: newPlaylistName.toUpperCase(), tracks: [] };
    setPlaylists((prev) => [...prev, newP]);
    setNewPlaylistName(''); setCreatingPlaylist(false);
    selectPlaylist(newP.id);
  };

  const saveDonate = () => {
    const val = donateInput.trim();
    setDonateUrl(val.startsWith('http') ? val : val ? `https://${val}` : '');
    setEditingDonate(false);
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
    setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
  };

  const seek = (pct: number) => {
    const a = audioRef.current;
    if (a && a.duration) { a.currentTime = (pct / 100) * a.duration; setProgress(pct); }
  };

  return (
    <div className="min-h-screen cyber-grid relative overflow-hidden">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-8 animate-fade-in gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass neon-border-pink flex items-center justify-center">
              <Icon name="AudioLines" className="text-neon-pink" size={22} />
            </div>
            <h1 className="font-display font-black text-2xl tracking-widest neon-text-cyan text-neon-cyan">
              NEON<span className="text-neon-pink neon-text-pink">LOFI</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {editingDonate ? (
              <div className="flex gap-2 animate-fade-in">
                <input
                  autoFocus
                  value={donateInput}
                  onChange={(e) => setDonateInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveDonate()}
                  placeholder="https://your-donate-link.com"
                  className="bg-background/40 border border-neon-cyan/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none w-64"
                />
                <button onClick={saveDonate} className="px-3 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors">
                  <Icon name="Check" size={16} />
                </button>
                <button onClick={() => setEditingDonate(false)} className="px-3 rounded-lg bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors">
                  <Icon name="X" size={16} />
                </button>
              </div>
            ) : (
              <>
                {donateUrl && (
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neon-pink/20 text-neon-pink border border-neon-pink/40 hover:bg-neon-pink/30 transition-all font-display text-xs tracking-wider neon-border-pink">
                    <Icon name="Heart" size={14} />
                    DONATE
                  </a>
                )}
                <button
                  onClick={() => { setDonateInput(donateUrl); setEditingDonate(true); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-foreground/20 text-foreground/60 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all text-xs font-display tracking-wider"
                >
                  <Icon name="Link" size={14} />
                  {donateUrl ? 'EDIT LINK' : 'ADD DONATE LINK'}
                </button>
              </>
            )}
            <span className="font-display text-xs tracking-[0.3em] text-neon-cyan/60 hidden md:block">// 2099 STREAM</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* PLAYER */}
          <section className="lg:col-span-3 glass rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-72 h-72 rounded-full bg-neon-purple/10 blur-2xl animate-pulse-glow" />
              <div
                className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-neon-pink/40 neon-border-pink"
                style={{ animation: isPlaying ? 'spin-slow 8s linear infinite' : 'none' }}
              >
                <img src={ANIME_ART} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/30 via-transparent to-neon-cyan/20" />
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-background/80 border-2 border-neon-cyan/50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-neon-cyan" />
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-2xl text-foreground tracking-wide mb-1">{currentTrack?.title || 'NO TRACK'}</h2>
              <p className="text-neon-cyan/70 text-sm tracking-wide">{currentTrack?.artist || '—'}</p>
            </div>

            {/* Equalizer bars */}
            <div className="flex items-end justify-center gap-1 h-12 mb-6">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-neon-pink to-neon-cyan"
                  style={{
                    height: isPlaying ? `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%` : '15%',
                    animation: isPlaying ? `pulse-glow ${0.6 + (i % 5) * 0.15}s ease-in-out infinite` : 'none',
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-1.5 rounded-full bg-foreground/10 cursor-pointer" onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
              }}>
                <div className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan relative transition-all" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white neon-border-cyan" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-foreground/40 font-display">
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`transition-colors ${shuffle ? 'text-neon-cyan neon-text-cyan' : 'text-foreground/40 hover:text-foreground/70'}`}
                title="Shuffle"
              >
                <Icon name="Shuffle" size={20} />
              </button>
              <button onClick={handlePrev} className="text-foreground/70 hover:text-neon-cyan transition-colors">
                <Icon name="SkipBack" size={28} />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center neon-border-pink hover:scale-105 transition-transform"
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={28} className="text-white" />
              </button>
              <button onClick={handleNext} className="text-foreground/70 hover:text-neon-cyan transition-colors">
                <Icon name="SkipForward" size={28} />
              </button>
              <button
                onClick={() => setRepeat((r) => !r)}
                className={`transition-colors ${repeat ? 'text-neon-pink neon-text-pink' : 'text-foreground/40 hover:text-foreground/70'}`}
                title="Repeat"
              >
                <Icon name="Repeat" size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <Icon name="Volume2" size={18} className="text-neon-cyan/70" />
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--neon-cyan))] h-1 cursor-pointer"
              />
              <span className="text-xs text-neon-cyan/60 w-8 font-display">{volume}</span>
            </div>
          </section>

          {/* PLAYLISTS */}
          <section className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm tracking-widest text-neon-cyan">PLAYLISTS</h3>
              <button onClick={() => setCreatingPlaylist((v) => !v)} className="text-neon-pink hover:scale-110 transition-transform">
                <Icon name="Plus" size={20} />
              </button>
            </div>

            {creatingPlaylist && (
              <div className="flex gap-2 mb-4 animate-fade-in">
                <input
                  autoFocus value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlaylist()}
                  placeholder="Playlist name..."
                  className="flex-1 bg-background/40 border border-neon-cyan/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
                <button onClick={addPlaylist} className="px-3 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors">
                  <Icon name="Check" size={18} />
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-5 flex-wrap">
              {playlists.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPlaylist(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display tracking-wider transition-all ${
                    p.id === activePlaylistId
                      ? 'bg-neon-pink/20 text-neon-pink neon-border-pink'
                      : 'bg-background/30 text-foreground/50 border border-foreground/10 hover:text-foreground'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {activePlaylist.tracks.length === 0 && (
                <p className="text-center text-foreground/40 text-sm py-8">Playlist is empty</p>
              )}
              {activePlaylist.tracks.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentTrackIndex(idx); setProgress(0); setCurrentTime(0); setIsPlaying(true); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    idx === currentTrackIndex && activePlaylist.id === activePlaylistId
                      ? 'bg-neon-cyan/10 neon-border-cyan'
                      : 'hover:bg-foreground/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-display ${idx === currentTrackIndex ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-foreground/10 text-foreground/40'}`}>
                    {idx === currentTrackIndex && isPlaying
                      ? <Icon name="AudioLines" size={15} className="text-neon-cyan" />
                      : <span>{idx + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${idx === currentTrackIndex ? 'text-neon-cyan' : 'text-foreground/90'}`}>{t.title}</p>
                    <p className="text-xs text-foreground/40 truncate">{t.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="text-center mt-10 text-foreground/30 text-xs tracking-[0.2em] font-display animate-fade-in" style={{ animationDelay: '0.3s' }}>
          NEONLOFI © 2099 — RELAX IN THE NEON CITY
        </footer>
      </div>
    </div>
  );
};

export default Index;
