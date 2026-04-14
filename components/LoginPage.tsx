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
      <main className="relative z-10 w-full max-w-md px-6">
        <div className="glass-panel p-10 rounded-xl shadow-[0_0_80px_rgba(236,220,255,0.08)] flex flex-col items-center text-center">
          
          {/* App Identity */}
          <div className="mb-12">
            <div className="relative inline-block mb-6">
              {/* Silhouette Logo Mockup */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
                <img 
                  className="w-full h-full object-cover mix-blend-luminosity" 
                  alt="Minimalist silhouette" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbLt1Y6eBJEjRShsq2AKpOXM7mnWkx4HYb1P5yGiGdXRCA-WLGylPBNnmGBW78pbaUD7ePdHDo1GaktlqbGViJlusyKA0_taDE20jyQ3mFbqeiKYigdrF_xJFc-YoPc_yqa1fCu36E0Io-drp6jiEnuyr2VM858oAxO0sahxq5s8YC_XCMgzSSGF4NxkmkWROWf4nhJYX5n_LgZaXUpBrpuISmQ911f_jQcVvGny8RUcEVuNDn3kHhhVm_q42pN_zBKEL3vLWzz-M"
                />
              </div>
            </div>
            <h1 className="text-4xl font-serif italic text-primary tracking-tight">LofiTunes</h1>
            <p className="mt-3 text-secondary/80 font-light tracking-widest text-sm uppercase font-body">your music, your vibe</p>
          </div>

          {/* Decorative Element: Submerged Card Effect */}
          <div className="w-full mb-10 p-4 rounded-lg bg-surface-container-lowest/20 shadow-inner">
            <p className="text-on-surface-variant text-sm leading-relaxed">
                              Step away from the noise. <br/>
                              Enter your digital sanctuary.
                          </p>
          </div>

          {/* Token expired notice */}
          {tokenExpired && (
            <div className="mb-6 bg-error-container/20 border border-error-container/40 rounded-lg py-2 px-4 text-xs text-error-dim">
              Your session expired. Please sign in again.
            </div>
          )}

          {/* Primary Action */}
          <button 
            onClick={() => signIn('google')}
            className="group relative w-full h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-semibold rounded-full flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(236,220,255,0.3)] active:scale-95"
          >
            <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <span>Login with YouTube</span>
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </button>
          
          <div className="mt-6">
            <p className="text-[10px] tracking-widest uppercase text-on-surface-variant/50">
              Press <span className="text-primary font-bold">G</span> to change scenery
            </p>
          </div>

        </div>

        {/* Ambient Floating Elements (Asymmetric Layout Decoration) */}
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
