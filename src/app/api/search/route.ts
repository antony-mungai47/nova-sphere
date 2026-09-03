import { NextResponse } from "next/server";

import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Use application service for search
    const results = await StorefrontProductQueryService.searchCatalog({ query });

    const formattedResults = results.slice(0, 5).map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      category: r.category,
      image: r.image
    }));

    return NextResponse.json({ results: formattedResults });

  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
