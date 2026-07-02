export function DockTooltip({ children }: { children: string }) {
  return (
    <span className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-[0.45rem] bg-[#2b2b2d] px-3 py-2 text-[0.9rem] font-medium leading-none text-foreground shadow-lg shadow-black/25 before:absolute before:left-1/2 before:top-full before:size-3 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:bg-[#2b2b2d] group-hover/action:block group-focus-visible/action:block">
      {children}
    </span>
  );
}
