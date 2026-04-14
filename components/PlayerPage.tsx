'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { GifBackground } from './GifBackground';
import { LoadingScreen } from './LoadingScreen';
import { useGifCycle } from '@/hooks/useGifCycle';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { fetchUserPlaylists, fetchPlaylistSongs } from '@/lib/youtube';
import { Playlist, Song } from '@/types/youtube';

interface PlayerPageProps {
  accessToken: string;
}

export function PlayerPage({ accessToken }: PlayerPageProps) {
  const { currentGif, cycleGif } = useGifCycle();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [currentSongs, setCurrentSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      async function doSearch() {
        setIsSearching(true);
        try {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery.trim())}&maxResults=10`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const data = await res.json();
          if (data.items) {
            setSearchResults(data.items);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Search error", err);
        } finally {
          setIsSearching(false);
        }
      }
      doSearch();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, accessToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const currentSong = currentSongs[currentSongIndex] || null;

  const handleSongEnd = useCallback(() => {
    setCurrentSongIndex(prev => {
      const next = (prev + 1) % (currentSongs.length || 1);
      return next;
    });
  }, [currentSongs.length]);

  const handleSkipError = useCallback(() => {
    // Auto-skip region locked / unplayable videos
    setCurrentSongIndex(prev => (prev + 1) % (currentSongs.length || 1));
  }, [currentSongs.length]);

  const { playerId, isPlaying, duration, currentTime, volume, loadAndPlay, togglePlay, setVolume, seekTo } =
    useYouTubePlayer({
      onEnded: handleSongEnd,
      onError: handleSkipError,
    });

  // Fetch playlists on mount
  useEffect(() => {
    async function load() {
      try {
        setIsLoadingPlaylists(true);
        const lists = await fetchUserPlaylists(accessToken);
        setPlaylists(lists);
        if (lists.length > 0) {
          setSelectedPlaylistId(lists[0].id);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
          signOut();
        } else {
          console.error('Failed to load playlists', err);
        }
      } finally {
        setIsLoadingPlaylists(false);
      }
    }
    load();
  }, [accessToken]);

  // Fetch songs when playlist changes
  useEffect(() => {
    if (!selectedPlaylistId) return;

    const playlist = playlists.find(p => p.id === selectedPlaylistId);
    if (!playlist) return;

    // Check cache
    if (playlist.songs.length > 0) {
      setCurrentSongs(playlist.songs);
      setCurrentSongIndex(0);
      return;
    }

    async function loadSongs() {
      try {
        setIsLoadingSongs(true);
        setCurrentSongs([]);
        const songs = await fetchPlaylistSongs(selectedPlaylistId!, accessToken);
        // Cache in playlist object
        setPlaylists(prev =>
          prev.map(p => (p.id === selectedPlaylistId ? { ...p, songs } : p))
        );
        setCurrentSongs(songs);
        setCurrentSongIndex(0);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
          signOut();
        } else {
          console.error('Failed to load songs', err);
        }
      } finally {
        setIsLoadingSongs(false);
      }
    }
    loadSongs();
  }, [selectedPlaylistId, playlists, accessToken]);

  // Load song into player when currentSongIndex changes
  const prevSongRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentSong) return;
    if (prevSongRef.current === currentSong.videoId) return;
    prevSongRef.current = currentSong.videoId;

    // Song transition animation
    setTimeout(() => {
      loadAndPlay(currentSong.videoId);
    }, 250);
  }, [currentSong, loadAndPlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentSongIndex(prev => (prev + 1) % (currentSongs.length || 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentSongIndex(prev =>
            prev === 0 ? (currentSongs.length || 1) - 1 : prev - 1
          );
          break;
        // G is handled in useGifCycle
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, currentSongs.length]);

  const handlePrev = () => {
    setCurrentSongIndex(prev =>
      prev === 0 ? (currentSongs.length || 1) - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentSongIndex(prev => (prev + 1) % (currentSongs.length || 1));
  };

  if (isLoadingPlaylists) {
    return <LoadingScreen message="Fetching your playlists..." />;
  }

  return (
    <div className="bg-background text-on-surface min-h-screen overflow-hidden flex font-body">
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-6 z-[60] text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center backdrop-blur-md bg-black/20 border border-white/10"
      >
        <span className="material-symbols-outlined text-3xl">menu</span>
      </button>

      {/* Full Screen Background Aesthetic */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-surface-dim/40 backdrop-blur-[2px] z-10"></div>
        <GifBackground gif={currentGif} onError={cycleGif} />
        {/* Dynamic Tint Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'var(--tint-color)' }}></div>
      </div>

      {/* SideNavBar (Solid) */}
      <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col p-6 bg-[#1c162c] w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-10 mt-14">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              alt="Woman logo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDovXlj35n-gsrUBLcrRPsjd6nlJ0o-uCEsNiQGdPNbXptQg8gXFNu5ikIrudP9PMrG2xf-7EM_RIj6MM-jfmxtIGpTaWbbGcVL8T4Q1TXcR1cM9mIHtS-6JNpfPx0kPq-7HeoBd5FMb6Z5dNKO3x8ojBa0gqX05c7E0ak5DbehEuCE--d8v_dKysuqIhnzzV98i_-Fe9qzPgRuc1Nf2rsHTzoiJPnjwIRZ7BaVn4hLOXec45TVw38hdHZJlg4ph67tDbP16wLCnHs"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif text-[#ecdcff] leading-none">LofiTunes</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">The Digital Sanctuary</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <a className="sidebar-link flex items-center gap-4 px-4 py-3 hover:bg-white/5" href="#">
            <span className="material-symbols-outlined">home</span>
            <span className="font-medium">Home</span>
          </a>
          <a className="sidebar-link flex items-center gap-4 px-4 py-3 hover:bg-white/5" href="#">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-medium">Discover</span>
          </a>
          <a className="sidebar-link active flex items-center gap-4 px-4 py-3 font-medium rounded-r-full" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>library_music</span>
            <span className="font-medium">Library</span>
          </a>
          <a className="sidebar-link flex items-center gap-4 px-4 py-3 hover:bg-white/5" href="#">
            <span className="material-symbols-outlined">playlist_play</span>
            <span className="font-medium">My Playlists</span>
          </a>
        </nav>

        <div className="mt-4 flex-1 flex flex-col min-h-0">
          <style>{`
            .search-input:focus {
              border-color: var(--accent-color) !important;
              box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 20%, transparent) !important;
            }
            .custom-thin-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255,255,255,0.15) transparent;
            }
            .playlist-item {
              padding: 8px 16px;
              border-left: 0px solid transparent;
            }
            .playlist-item:hover, .playlist-item.active {
              padding-left: 14px !important;
              border-left: 2px solid var(--accent-color) !important;
            }
          `}</style>
          
          <div className="mb-4 relative px-6" ref={searchRef}>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search songs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0 || searchQuery.trim() !== '') setShowDropdown(true); }}
                className="search-input w-full h-[36px] bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-lg px-3 text-[13px] text-white placeholder:text-white/40 outline-none transition-all"
              />
            </div>
            
            {showDropdown && searchQuery.trim() !== '' && (
              <div className="absolute top-11 left-6 right-6 bg-[#251e38] border border-white/10 rounded-lg shadow-xl z-50 p-2 max-h-[300px] overflow-y-auto custom-thin-scrollbar">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-white/50">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(item => (
                    <div 
                      key={item.id.videoId}
                      className="w-full p-[10px_16px] rounded-[8px] bg-white/[0.04] border border-white/5 mb-1 text-[13px] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all duration-200 cursor-pointer overflow-hidden"
                      onClick={() => {
                        loadAndPlay(item.id.videoId);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="text-ellipsis overflow-hidden whitespace-nowrap">{item.snippet.title}</div>
                      <div className="text-[10px] text-white/40 mt-1 text-ellipsis overflow-hidden whitespace-nowrap">{item.snippet.channelTitle}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-white/50">No results found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 custom-thin-scrollbar">
            <p className="text-[10px] text-[rgba(255,255,255,0.3)] font-normal uppercase tracking-[0.1em] pt-3 pb-2 px-4">Your Playlists</p>
            <div className="flex flex-col gap-0">
              {playlists.map(p => {
                const isActive = p.id === selectedPlaylistId;
                return (
                  <div 
                    key={p.id} 
                    className={`playlist-item w-full text-[13px] transition-all duration-150 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap ${isActive ? 'active text-white font-medium' : 'text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.9)]'}`}
                    onClick={() => { setSelectedPlaylistId(p.id); setCurrentSongIndex(0); }}
                  >
                    {p.title}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-4 border-t border-white/10 mt-4 -mx-2 px-2">
          <button 
            onClick={() => signOut()} 
            className="flex items-center gap-3 w-full px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-[13px] font-medium group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:text-[var(--accent-color)] transition-colors">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`relative z-10 flex flex-col items-center justify-center h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-0 w-full'}`}>
        
        {/* Top Navigation Area Removed */}

        {/* Hero Music Player Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 max-w-2xl px-6 w-full -mt-24">
          <h1 className="text-5xl md:text-7xl font-serif text-[#ecdcff] italic leading-tight text-glow line-clamp-2 px-4 transition-all duration-300">
            {currentSong ? currentSong.title : 'Loading...'}
          </h1>
          <p className="text-xl text-[#c4847a] font-light tracking-wide italic transition-all duration-300 mb-2">
            {currentSong ? currentSong.artist : '—'}
          </p>
          <p className="mt-2 text-[10px] text-white/40 tracking-[0.2em] font-light uppercase">
            {isLoadingSongs ? 'Loading...' : `${currentSongIndex + 1} / ${currentSongs.length || 0}`}
          </p>

        </div>

        {/* Frosted Player Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 48px)',
            maxWidth: '780px',
            zIndex: 50,
            overflow: 'hidden',
            borderRadius: '20px',
            backdropFilter: 'blur(24px)',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
            {/* Progress Slider Row */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', paddingRight: '12px' }}>
              <span className="text-[10px] font-medium text-white/60 tracking-widest" style={{ minWidth: '32px', textAlign: 'right' }}>
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
              </span>
              <div 
                className="h-2 bg-white/10 rounded-full relative cursor-pointer group"
                style={{ flex: 1 }}
                onClick={(e) => {
                  if (!duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  seekTo((x / rect.width) * duration);
                }}
              >
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-100" 
                  style={{ backgroundColor: 'var(--accent-color)', width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
                {/* Progress Thumb */}
                <div 
                  className="progress-thumb absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-medium text-white/60 tracking-widest" style={{ minWidth: '32px' }}>
                {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Bottom Controls Row — 3-column flex */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* LEFT column: shuffle + repeat */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-start' }} className="text-white/40">
                <button className="hover:text-white hover:scale-110 transition-all"><span className="material-symbols-outlined text-lg">shuffle</span></button>
                <button className="hover:text-white hover:scale-110 transition-all"><span className="material-symbols-outlined text-lg">repeat</span></button>
              </div>

              {/* CENTER column: prev + play/pause + next */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
                <button onClick={handlePrev} className="text-white/60 hover:text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
                </button>

                <button 
                  onClick={togglePlay}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--accent-color)',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    transition: 'transform 0.3s',
                  }}
                  className="hover:scale-105"
                >
                  <span className="material-symbols-outlined text-3xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>

                <button onClick={handleNext} className="text-white/60 hover:text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
                </button>
              </div>

              {/* RIGHT column: volume icon + slider */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }} className="group">
                <span className="material-symbols-outlined text-white/40 text-lg group-hover:text-white transition-colors">volume_up</span>
                <div 
                  className="h-1.5 bg-white/10 rounded-full cursor-pointer relative"
                  style={{ width: '80px' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                    setVolume(Math.round((x / rect.width) * 100));
                  }}
                >
                  <div className="h-full rounded-full transition-all duration-150 relative" style={{ backgroundColor: 'var(--accent-color)', width: `${volume}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Keyboard Shortcut Hints */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 z-50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold text-white/40">Space</span>
            <span className="text-[9px] uppercase tracking-widest text-white/20">Play/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold text-white/40">← →</span>
            <span className="text-[9px] uppercase tracking-widest text-white/20">Seek</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold text-white/40">G</span>
            <span className="text-[9px] uppercase tracking-widest text-white/20">Scenery</span>
          </div>
        </div>
      </main>

      {/* Overlay Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3oQSJ2mNp-Q_oyK_iBmfT26lstkgjJ-xwUwnnb3dZVP9fBnz05pJAcQXy-K7cb7K9aX5iLs6D2GCmrUpAkOFxQRI-7U0jrTXdH-WrVU6XUMfViWG5EtD9kvUevHnljYlU1S430Z3s_MqlwBmAoEVPL0l-YrVPC8g3nc0V54czgB-KUFen4860Th3VnSOywl1oH_N2nb0mAPmVbBtH4MIVUqkfRa4fFTa33fC9hq41TJ-pfZi_F6lJWKAinpB1npA7ermDQoBOEM')" }}></div>

      {/* Hidden YouTube player container */}
      <div
        id={playerId}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          left: -9999,
          top: -9999,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
