import React from 'react';
import { prisma } from '@/lib/prisma';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProductImageService } from '@/modules/commerce/services/ProductImageService';

export default async function WishlistPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { images: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
        <Heart className="w-8 h-8 text-nova-accent fill-nova-accent" />
        <h1 className="text-3xl font-bold text-white">Your Wishlist</h1>
        <span className="ml-auto bg-white/10 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {items.length} Items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-nova-silver mb-6">Explore the marketplace and save your favorite items.</p>
          <Link href="/store" className="bg-nova-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const primaryImage = ProductImageService.getPrimaryImageUrl(item.product);
            
            return (
              <div key={item.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col relative">
                {/* Remove Button */}
                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white text-white/70">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* Image */}
                <div className="relative aspect-square w-full bg-white/5 overflow-hidden">
                  <Image 
                    src={primaryImage}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-white line-clamp-1 mb-1">{item.product.name}</h3>
                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <span className="text-xl font-bold text-nova-accent">${Number(item.product.price).toLocaleString()}</span>
                    {item.product.stock > 0 ? (
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-1 rounded">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-400 font-semibold bg-red-400/10 px-2 py-1 rounded">Sold Out</span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/store/product/${item.productId}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-colors text-sm"
                  >
                    View Details <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
