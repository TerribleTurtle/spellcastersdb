import Image from "next/image";

export function InspectorEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-text-dimmed bg-surface-main/30 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="mb-6 relative w-24 h-24 opacity-80">
          <Image
            src="/logo.svg"
            alt="SpellcastersDB Logo"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-wider mb-2">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
            SPELLCASTERS
          </span>
          <span className="text-text-primary">DB</span>
        </h1>

        <div className="h-px w-16 bg-linear-to-r from-transparent via-white/20 to-transparent my-4" />

        <h2 className="text-lg font-bold text-text-secondary">
          Ready to Forge?
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-[200px]">
          Select a Unit or Spellcaster from the vault to inspect details.
        </p>
      </div>
    </div>
  );
}
