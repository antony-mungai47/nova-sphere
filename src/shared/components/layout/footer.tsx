import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Video, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export async function Footer() {
  const settings = await prisma.storeSettings.findFirst();

  return (
    <footer className="bg-surface border-t border-border mt-0 pt-20 pb-8 text-foreground">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center space-x-2 mb-6 group inline-flex">
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
              <span className="text-xl font-bold tracking-widest text-foreground">NOVA<span className="text-cta-primary">SPHERE</span></span>
            </Link>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-sm">
              {settings?.storeDescription || "The 2026-standard marketplace. Discover premium items curated from top vendors around the globe with lightning-fast delivery."}
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-muted">
                <Phone size={16} className="mr-3 text-cta-primary" />
                <span>+1 (800) 555-NOVA</span>
              </div>
              <div className="flex items-center text-sm text-muted">
                <Mail size={16} className="mr-3 text-cta-primary" />
                <span>support@novasphere.com</span>
              </div>
              <div className="flex items-center text-sm text-muted">
                <MapPin size={16} className="mr-3 text-cta-primary" />
                <span>123 Commerce Blvd, Tech District</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <a href={settings?.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-cta-primary hover:border-cta-primary transition-colors text-xs font-bold">
                TW
              </a>
              <a href={settings?.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-cta-primary hover:border-cta-primary transition-colors text-xs font-bold">
                IG
              </a>
              <a href={settings?.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-cta-primary hover:border-cta-primary transition-colors text-xs font-bold">
                FB
              </a>
              <a href={settings?.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-cta-primary hover:border-cta-primary transition-colors text-xs font-bold">
                IN
              </a>
            </div>
          </div>

          {/* Links Col 1: Shop */}
          <div className="md:col-span-2">
            <h4 className="text-foreground font-heading font-bold mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/store" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">All Products</Link></li>
              <li><Link href="/store?category=Electronics" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Electronics</Link></li>
              <li><Link href="/store?category=Fashion" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Fashion</Link></li>
              <li><Link href="/store?category=Home" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Home & Garden</Link></li>
              <li><Link href="/store?category=Sports" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Sports & Outdoors</Link></li>
            </ul>
          </div>

          {/* Links Col 2: Support */}
          <div className="md:col-span-2">
            <h4 className="text-foreground font-heading font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Help Center</Link></li>
              <li><Link href="/shipping" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Returns Policy</Link></li>
              <li><Link href="/track" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Track Order</Link></li>
              <li><Link href="/contact" className="text-muted hover:text-cta-primary transition-colors text-sm font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="md:col-span-4">
            <h4 className="text-foreground font-heading font-bold mb-6">Subscribe</h4>
            <p className="text-muted text-sm mb-4">
              Join our newsletter for exclusive offers, updates, and 10% off your first purchase.
            </p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-background border border-border rounded-button px-4 py-2 text-sm focus:outline-none focus:border-cta-primary transition-colors"
                required
              />
              <Button type="button" variant="primary">Subscribe</Button>
            </form>
            <p className="text-xs text-muted mt-4">
              By subscribing, you agree to our <Link href="/terms" className="underline hover:text-foreground">Terms</Link> & <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} NOVA SPHERE MARKETPLACE. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="flex space-x-2 text-xl opacity-50 grayscale hover:grayscale-0 transition-all">
              <span>💳</span>
              <span>🏦</span>
              <span>🪙</span>
              <span>🍎</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
