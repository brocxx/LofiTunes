'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GifBackground } from '@/components/GifBackground';
import { useGifCycle } from '@/hooks/useGifCycle';

const demoTracks = [
  { title: 'Iktara (Lofi Edit)', artist: 'Kavita Seth · Demo track', duration: '3:42' },
  { title: 'Kasoor — Midnight Mix', artist: 'Prateek Kuhad · Demo track', duration: '4:06' },
  { title: 'Shaam, After Hours', artist: 'Amit Trivedi · Demo track', duration: '3:31' },
];

const demoPlaylists = [
  { name: 'Late Night Chai', count: '18 tracks', icon: 'nightlight' },
  { name: 'Soft Focus', count: '24 tracks', icon: 'filter_drama' },
  { name: 'Rain on Repeat', count: '12 tracks', icon: 'rainy' },
];

export default function DemoPage() {
  const { currentGif, cycleGif } = useGifCycle();
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const track = demoTracks[selectedTrack];

  const moveTrack = (step: number) => {
    setSelectedTrack((current) => (current + step + demoTracks.length) % demoTracks.length);
    setPlaying(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#100c1b] text-[#ebe1ff] font-body">
      <div className="fixed inset-0">
        <GifBackground gif={currentGif} onError={cycleGif} />
        <div className="absolute inset-0 bg-[#100c1b]/65 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_43%,rgba(145,102,155,0.18),transparent_58%)]" />
      </div>

      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="fixed left-5 top-5 z-30 rounded-xl border border-white/10 bg-black/30 p-3 text-white/70 backdrop-blur-xl hover:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      <aside className={`fixed inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-white/[0.08] bg-[#120f1ce8] p-5 backdrop-blur-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl italic tracking-tight text-[#ecdcff]">LofiTunes<span className="text-[#c4847a]">.</span></Link>
          <button onClick={() => setSidebarOpen(false)} aria-label="Collapse sidebar" className="rounded-lg p-2 text-white/35 hover:bg-white/5 hover:text-white/80">
            <span className="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>

        <div className="mt-9 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c99da0] to-[#695982] text-sm font-semibold text-white">G</div>
            <div>
              <p className="text-sm font-medium text-white/90">Guest listener</p>
              <p className="mt-0.5 text-[11px] text-white/40">Preview session</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#b4c6a4] shadow-[0_0_10px_#b4c6a4]" />
          </div>
        </div>

        <nav className="mt-7 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Discover</p>
          <a className="flex items-center gap-3 rounded-xl bg-white/[0.08] px-3 py-2.5 text-sm text-white" href="#for-you"><span className="material-symbols-outlined text-[19px] text-[#d7bdd8]">home</span>Made for tonight</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white" href="#playlists"><span className="material-symbols-outlined text-[19px]">library_music</span>Your library</a>
        </nav>

        <section id="playlists" className="mt-8 flex-1">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Playlists</p>
            <span className="material-symbols-outlined text-[17px] text-white/30">add</span>
          </div>
          <div className="space-y-1">
            {demoPlaylists.map((playlist, index) => (
              <button key={playlist.name} onClick={() => setSelectedTrack(index % demoTracks.length)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-gradient-to-br from-[#30243b] to-[#1b2030] text-[#d5bdcf]"><span className="material-symbols-outlined text-[18px]">{playlist.icon}</span></span>
                <span className="min-w-0"><span className="block truncate text-[13px] text-white/75 group-hover:text-white">{playlist.name}</span><span className="mt-0.5 block text-[10px] text-white/35">{playlist.count}</span></span>
              </button>
            ))}
          </div>
        </section>

        <div className="border-t border-white/[0.07] pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/80"><span className="material-symbols-outlined text-lg">login</span>Back to sign in</Link>
        </div>
      </aside>

      <section className={`relative z-10 flex min-h-screen flex-col transition-[margin] duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        <header className="flex items-center justify-between px-8 py-6 sm:px-12">
          <div className="flex items-center gap-2 text-xs text-white/40"><span className="material-symbols-outlined text-base">graphic_eq</span> A little quiet, just for you</div>
          <span className="rounded-full border border-[#d8c3dc]/15 bg-[#d8c3dc]/[0.07] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-[#e2cde4]/70">Guest preview</span>
        </header>

        <div id="for-you" className="flex flex-1 flex-col items-center justify-center px-6 pb-36 text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] shadow-[0_0_80px_rgba(207,164,205,0.12)]">
            <span className="material-symbols-outlined text-3xl text-[#e4cfe2]">headphones</span>
          </div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-[#d9b9c4]/65">Tonight’s little soundtrack</p>
          <h1 className="max-w-3xl font-serif text-4xl italic leading-tight text-[#f1e4f5] drop-shadow-[0_0_28px_rgba(236,220,255,0.25)] sm:text-6xl md:text-7xl">{track.title}</h1>
          <p className="mt-4 text-sm tracking-wide text-[#d8b4ae]/80">{track.artist}</p>
          <div className="mt-7 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35"><span className="h-px w-8 bg-white/15" />Demo track · preview only<span className="h-px w-8 bg-white/15" /></div>

          <div className="mt-14 flex items-center gap-2">
            {demoTracks.map((item, index) => (
              <button key={item.title} aria-label={`Play ${item.title}`} onClick={() => { setSelectedTrack(index); setPlaying(true); }} className={`h-1 rounded-full transition-all ${index === selectedTrack ? 'w-8 bg-[#dfc6df]' : 'w-3 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
        </div>

        <div className="fixed bottom-7 left-1/2 z-30 w-[min(720px,calc(100%-32px))] -translate-x-1/2" style={{ left: sidebarOpen ? 'calc(50% + 140px)' : '50%' }}>
          <div className="rounded-2xl border border-white/[0.09] bg-[#120f1ccc] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:px-7">
            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono text-white/35"><span>1:18</span><div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-gradient-to-r from-[#b894bb] to-[#e5d5e5]" /></div><span>{track.duration}</span></div>
            <div className="flex items-center justify-between">
              <div className="hidden min-w-0 items-center gap-3 sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#59435e] to-[#272438]"><span className="material-symbols-outlined text-lg text-[#e2cde4]">music_note</span></div><div className="min-w-0"><p className="truncate text-[11px] text-white/75">{track.title}</p><p className="truncate text-[10px] text-white/35">{track.artist}</p></div></div>
              <div className="flex items-center gap-5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                <button aria-label="Previous track" onClick={() => moveTrack(-1)} className="text-white/50 transition hover:scale-110 hover:text-white"><span className="material-symbols-outlined text-2xl">skip_previous</span></button>
                <button aria-label={playing ? 'Pause demo' : 'Play demo'} onClick={() => setPlaying(!playing)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4d3e5] text-[#211b2a] shadow-[0_0_24px_rgba(218,190,220,0.25)] transition hover:scale-105"><span className="material-symbols-outlined text-2xl">{playing ? 'pause' : 'play_arrow'}</span></button>
                <button aria-label="Next track" onClick={() => moveTrack(1)} className="text-white/50 transition hover:scale-110 hover:text-white"><span className="material-symbols-outlined text-2xl">skip_next</span></button>
              </div>
              <button onClick={cycleGif} className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 transition hover:text-white/80"><span className="material-symbols-outlined text-lg">palette</span><span className="hidden sm:inline">Change scene</span></button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
