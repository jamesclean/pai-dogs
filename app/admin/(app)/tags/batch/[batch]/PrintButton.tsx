"use client";
export function PrintButton() {
  return (
    <button type="button" className="btn-secondary flex-1" onClick={() => window.print()}>
      Print sheet
    </button>
  );
}
