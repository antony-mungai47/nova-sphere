import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import { AccountClient } from "./account-client";
import { ProductImageService } from "@/modules/commerce/services/ProductImageService";
import { IdentityFacade } from "@/modules/identity/IdentityFacade";

export default async function AccountPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/login");
  }

  // IdentityService will sync the user if they don't exist
  const dbUser = await IdentityFacade.getOrCreateUser();

  if (!dbUser) {
    redirect("/login");
  }

  // Fetch orders
  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { 
          product: {
            include: { images: true }
          }
        }
      }
    }
  });

  // Fetch wishlist
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { images: true }
      }
    }
  });

  // Fetch addresses
  const addresses = await prisma.address.findMany({
    where: { userId: dbUser.id },
    orderBy: { isDefault: "desc" }
  });

  // Format data for client
  const formattedOrders = orders.map(o => ({
    id: o.id,
    createdAt: o.createdAt,
    totalAmount: o.totalAmount,
    status: o.status,
    items: o.items.map(i => ({
      id: i.id,
      quantity: i.quantity,
      price: i.price,
      product: {
        id: i.product.id,
        name: i.product.name,
        image: ProductImageService.getThumbnailUrl(i.product)
      }
    }))
  }));

  const formattedWishlist = wishlistItems.map(w => ({
    id: w.product.id,
    name: w.product.name,
    price: w.product.salePrice || w.product.price,
    image: ProductImageService.getThumbnailUrl(w.product),
    brand: w.product.brand,
    category: w.product.category
  }));

  const formattedUser = {
    name: dbUser.name,
    email: dbUser.email,
    imageUrl: clerkUser.imageUrl
  };

  return (
    <>
      <Navbar />
      <AccountClient 
        user={formattedUser}
        orders={formattedOrders}
        wishlist={formattedWishlist}
        addresses={addresses}
      />
      <Footer />
    </>
  );
}
