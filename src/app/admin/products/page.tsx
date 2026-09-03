import React from "react";
import { ProductsClient } from "./products-client";


import { AdminProductQueryService } from "@/modules/commerce/application/queries/AdminProductQueryService";

export default async function AdminProducts() {
  const formattedProducts = await AdminProductQueryService.getAllProducts();

  return <ProductsClient initialProducts={formattedProducts} />;
}
