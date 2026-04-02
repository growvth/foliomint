/**
 * Shared background treatment for public portfolio + blog (classic theme only).
 */
export function PortfolioAmbientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[20%] top-[-10%] h-[min(520px,55vh)] w-[min(520px,55vh)] rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="absolute -right-[15%] bottom-[-20%] h-[min(480px,50vh)] w-[min(480px,50vh)] rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-px w-[min(90%,64rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-border/80 to-transparent" />
    </div>
  );
}
