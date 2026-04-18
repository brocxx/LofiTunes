'use client';

import { signIn } from 'next-auth/react';

import { GifBackground } from './GifBackground';
import { useGifCycle } from '@/hooks/useGifCycle';

interface LoginPageProps {
  tokenExpired?: boolean;
}

export function LoginPage({ tokenExpired }: LoginPageProps) {
  const { currentGifIndex, currentGif, cycleGif } = useGifCycle();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center overflow-hidden selection:bg-primary/30">
      {/* Background Layer: Lo-fi Animated Aesthetic */}
      <div className="fixed inset-0 z-0">
        <GifBackground gif={currentGif} onError={cycleGif} />
        {/* Pastel Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface/80 via-surface-container-low/60 to-primary/10"></div>
      </div>

      {/* Login Content Canvas */}
      <main className="relative z-10 w-full max-w-sm px-6">
        <div className="glass-panel p-8 rounded-2xl shadow-[0_0_80px_rgba(236,220,255,0.08)] flex flex-col items-center text-center">
          
          {/* App Identity — No image, just styled text */}
          <div className="mb-8">
            <h1
              className="text-5xl font-serif italic leading-tight"
              style={{
                background: 'linear-gradient(135deg, #ecdcff 0%, #c4847a 50%, #ecdcff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(236,220,255,0.3))',
              }}
            >
              LofiTunes
            </h1>
            <p className="mt-2 text-secondary/80 font-light tracking-[0.25em] text-xs uppercase font-body">your music, your vibe</p>
          </div>

          {/* Tagline */}
          <p className="text-on-surface-variant/70 text-sm leading-relaxed mb-8">
            Step away from the noise.<br/>
            Enter your digital sanctuary.
          </p>

          {/* Token expired notice */}
          {tokenExpired && (
            <div className="mb-4 bg-error-container/20 border border-error-container/40 rounded-lg py-2 px-4 text-xs text-error-dim w-full">
              Your session expired. Please sign in again.
            </div>
          )}

          {/* Primary Action — Glowing button */}
          <button 
            onClick={() => signIn('google')}
            className="group relative w-full h-14 font-semibold rounded-full flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.03] active:scale-95 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(236,220,255,0.15) 0%, rgba(196,135,122,0.25) 100%)',
              border: '1px solid rgba(236,220,255,0.25)',
              boxShadow: '0 0 30px rgba(236,220,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: '#ecdcff',
            }}
          >
            <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1", color: '#c4847a' }}>play_circle</span>
            <span className="text-sm tracking-wide">Login with YouTube</span>
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(236,220,255,0.08), rgba(196,135,122,0.12))' }}
            ></div>
          </button>
          
          <div className="mt-5">
            <p className="text-[10px] tracking-widest uppercase text-on-surface-variant/40">
              Press <span className="text-primary font-bold">G</span> to change scenery
            </p>
          </div>

        </div>

        {/* Ambient Floating Elements */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full"></div>
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/10 blur-[80px] rounded-full"></div>
      </main>

      {/* Visual Artifacts */}
      <div className="fixed bottom-10 left-10 hidden md:block">
        <div className="flex items-center gap-3 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-sm">nest_eco_leaf</span>
          <span className="text-xs font-light tracking-wide italic font-serif">Curated with heart.</span>
        </div>
      </div>

    </div>
  );
}
