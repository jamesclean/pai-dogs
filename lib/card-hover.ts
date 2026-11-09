/** Calls enter and leave as the pointer moves over the link card around `art`. Returns a cleanup. */
export function onCardHover(art: Element, enter: () => void, leave: () => void) {
  const card = art.closest("a");
  if (!card) return;
  card.addEventListener("pointerenter", enter);
  card.addEventListener("pointerleave", leave);
  return () => {
    card.removeEventListener("pointerenter", enter);
    card.removeEventListener("pointerleave", leave);
  };
}
