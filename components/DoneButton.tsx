import { Done } from "./Icons";
import { HoverLabel } from "./HoverLabel";

export function DoneButton({ action, raised = false }: { action: () => Promise<void>; raised?: boolean }) {
  return (
    <form action={action}>
      <button aria-label="Mark done" className={`circle-btn group relative z-10 hover:z-40 focus-visible:z-40 ${raised ? "bg-surface-raised!" : ""}`}>
        <Done className="h-5 w-5" />
        <HoverLabel className="top-full right-0 mt-2">Mark done</HoverLabel>
      </button>
    </form>
  );
}
