// Bottom sheet over a dimmed page, as in "Report sent".
export function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--scrim)] px-2 pb-[max(env(safe-area-inset-bottom),8px)]">
      <div role="dialog" aria-modal className="sheet-in w-full max-w-[440px] rounded-[36px] bg-bg px-6 pt-6 pb-7 shadow-float">
        {children}
      </div>
    </div>
  );
}
