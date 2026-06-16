import React from "react";
import Image from "next/image";

interface WatermarkProps {
  className?: string;
  enabled: boolean;
  opacity: number;
  logoUrl: string;
}

export function Watermark({ className = "", enabled, opacity, logoUrl }: WatermarkProps) {
  if (!enabled) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none ${className}`}>
      <div 
        className="relative w-[120%] h-[120%] md:w-[80%] md:h-[80%] max-w-[800px]"
        style={{ opacity }}
      >
        <Image 
          src={logoUrl || "/logo.png"} 
          alt="Watermark" 
          fill 
          className="object-contain"
          priority
          sizes="(max-width: 768px) 120vw, 800px"
        />
      </div>
    </div>
  );
}
