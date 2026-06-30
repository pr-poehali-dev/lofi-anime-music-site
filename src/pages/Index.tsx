import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ANIME_ART = 'https://cdn.poehali.dev/projects/a5636f52-1afb-4e11-a672-22eb126baf64/files/d39b06c6-1b2a-4244-b2af-e87e488b6e0c.jpg';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

const initialPlaylists: Playlist[] = [
  {
    id: 1,
    name: 'NEON NIGHTS',
    tracks: [
      { id: 1, title: 'Tokyo Rain', artist: 'Synth Dreamer', duration: '3:24' },
      { id: 2, title: 'Neon Pulse', artist: 'Lo-Fi Ghost', duration: '2:58' },
      { id: 3, title: 'Cyber Lullaby', artist: 'Midnight Coder', duration: '4:12' },
      { id: 4, title: 'Hologram Heart', artist: 'Void Wave', duration: '3:45' },
    ],
  },
  {
    id: 2,
    name: 'CHILL SECTOR',
    tracks: [
      { id: 5, title: 'Rooftop 2099', artist: 'Static Bloom', duration: '3:10' },
      { id: 6, title: 'Soft Glitch', artist: 'Neo Kyoto', duration: '2:40' },
      { id: 7, title: 'Rainy Server', artist: 'Data Stream', duration: '3:55' },
    ],
  },
];

const Index = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [activePlaylistId, setActivePlaylistId] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(70);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)!;
  const currentTrack = activePlaylist.tracks[currentTrackIndex];

  const handleNext = () => {
    setCurrentTrackIndex((i) => (i + 1) % activePlaylist.tracks.length);
    setProgress(0);
  };
  const handlePrev = () => {
    setCurrentTrackIndex((i) => (i - 1 + activePlaylist.tracks.length) % activePlaylist.tracks.length);
    setProgress(0);
  };
  const selectPlaylist = (id: number) => {
    setActivePlaylistId(id);
    setCurrentTrackIndex(0);
    setProgress(0);
  };
  const addPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newP: Playlist = { id: Date.now(), name: newPlaylistName.toUpperCase(), tracks: [] };
    setPlaylists((prev) => [...prev, newP]);
    setNewPlaylistName('');
    setCreatingPlaylist(false);
    selectPlaylist(newP.id);
  };

  return (
    <div className="min-h-screen cyber-grid relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass neon-border-pink flex items-center justify-center">
              <Icon name="AudioLines" className="text-neon-pink" size={22} />
            </div>
            <h1 className="font-display font-black text-2xl tracking-widest neon-text-cyan text-neon-cyan">
              NEON<span className="text-neon-pink neon-text-pink">LOFI</span>
            </h1>
          </div>
          <span className="font-display text-xs tracking-[0.3em] text-neon-cyan/60">// 2099 STREAM</span>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 glass rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-72 h-72 rounded-full bg-neon-purple/10 blur-2xl animate-pulse-glow" />
              <div
                className={`relative w-72 h-72 rounded-full overflow-hidden border-4 border-neon-pink/40 neon-border-pink ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              >
                <img src={ANIME_ART} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/30 via-transparent to-neon-cyan/20" />
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-background/80 border-2 border-neon-cyan/50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-neon-cyan" />
                </div>
              </div>
              <div className="absolute inset-0 m-auto w-72 h-72 rounded-full border border-neon-cyan/10 pointer-events-none" />
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-2xl text-foreground tracking-wide mb-1">{currentTrack?.title || 'NO TRACK'}</h2>
              <p className="text-neon-cyan/70 text-sm tracking-wide">{currentTrack?.artist || '—'}</p>
            </div>

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

            <div className="mb-6">
              <div className="h-1.5 rounded-full bg-foreground/10 cursor-pointer" onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setProgress(Math.round(((e.clientX - r.left) / r.width) * 100));
              }}>
                <div className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white neon-border-cyan" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
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
            </div>

            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <Icon name="Volume2" size={18} className="text-neon-cyan/70" />
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--neon-cyan))] h-1"
              />
              <span className="text-xs text-neon-cyan/60 w-8 font-display">{volume}</span>
            </div>
          </section>

          <section className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm tracking-widest text-neon-cyan">ПЛЕЙЛИСТЫ</h3>
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
                  placeholder="Название..."
                  className="flex-1 bg-background/40 border border-neon-cyan/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:neon-border-cyan"
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

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {activePlaylist.tracks.length === 0 && (
                <p className="text-center text-foreground/40 text-sm py-8">Плейлист пуст</p>
              )}
              {activePlaylist.tracks.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentTrackIndex(idx); setProgress(0); setIsPlaying(true); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                    idx === currentTrackIndex ? 'bg-neon-cyan/10 neon-border-cyan' : 'hover:bg-foreground/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${idx === currentTrackIndex ? 'bg-neon-cyan/20' : 'bg-foreground/10'}`}>
                    <Icon name={idx === currentTrackIndex && isPlaying ? 'AudioLines' : 'Music'} size={15} className={idx === currentTrackIndex ? 'text-neon-cyan' : 'text-foreground/60'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${idx === currentTrackIndex ? 'text-neon-cyan' : 'text-foreground/90'}`}>{t.title}</p>
                    <p className="text-xs text-foreground/40 truncate">{t.artist}</p>
                  </div>
                  <span className="text-xs text-foreground/40 font-display">{t.duration}</span>
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
