import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Prisma native search using contains
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: 5, // Limit results for autocomplete
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        images: {
          take: 1,
          select: { url: true }
        }
      }
    });

    const formattedResults = results.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      category: r.category,
      image: r.images[0]?.url || ''
    }));

    return NextResponse.json({ results: formattedResults });

  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
