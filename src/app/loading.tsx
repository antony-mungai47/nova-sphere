export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        {/* Animated spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-nova-blue animate-spin" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold tracking-widest text-sm uppercase">NOVA</span>
          <span className="text-nova-blue font-bold tracking-widest text-sm uppercase">SPHERE</span>
        </div>
      </div>
    </div>
  );
}
