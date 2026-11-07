"use client";
export function PrintButton() {
  return (
    <button type="button" className="btn-gray" onClick={() => window.print()}>
      Print / save as PDF
    </button>
  );
}
