// iOS-style toggle built on a real checkbox, so it posts with the form.
export function Switch({ name, defaultChecked }: { name: string; defaultChecked?: boolean }) {
  return (
    <input
      type="checkbox"
      name={name}
      defaultChecked={defaultChecked}
      className="relative h-[31px] w-[51px] shrink-0 cursor-pointer appearance-none rounded-full bg-fill transition-colors duration-200 before:absolute before:top-[2px] before:left-[2px] before:h-[27px] before:w-[27px] before:rounded-full before:bg-white before:shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] before:transition-transform before:duration-200 checked:bg-ok checked:before:translate-x-5"
    />
  );
}
