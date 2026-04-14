'use client';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: 'var(--muted-text)',
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
