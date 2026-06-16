import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Video } from "lucide-react";

export async function Footer() {
  const settings = await prisma.storeSettings.findFirst();

  return (
    <footer className="border-t border-white/10 bg-nova-charcoal relative overflow-hidden mt-20 pt-16 pb-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-nova-blue/50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-nova-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4 inline-flex">
              <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                <Image 
                  src={settings?.storeLogo || "/logo.png"} 
                  alt="Nova Sphere Logo" 
                  fill 
                  className="object-contain" 
                  sizes="40px"
                  quality={95}
                />
              </div>
              <span className="text-xl font-bold tracking-widest text-white">NOVA<span className="text-nova-blue">SPHERE</span></span>
            </Link>
            <p className="text-nova-silver max-w-sm mb-6">
              {settings?.storeDescription || "The future of smart shopping. Discover premium AI-powered devices and luxury electronics built for tomorrow."}
            </p>
            <div className="flex space-x-4">
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors font-medium text-xs">
                  X
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors font-medium text-xs">
                  IG
                </a>
              )}
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors font-medium text-xs">
                  FB
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors font-medium text-xs">
                  IN
                </a>
              )}
              {settings?.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
                  <Video className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/store" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">All Products</Link></li>
              <li><Link href="/store?category=Electronics" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Electronics</Link></li>
              <li><Link href="/store?category=Home%20%26%20Kitchen" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Home & Kitchen</Link></li>
              <li><Link href="/store?category=Gaming" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Gaming</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/shipping" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Shipping</Link></li>
              <li><Link href="/returns" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Returns</Link></li>
              <li><Link href="/contact" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-nova-silver">
          <p>&copy; {new Date().getFullYear()} NOVA SPHERE. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
