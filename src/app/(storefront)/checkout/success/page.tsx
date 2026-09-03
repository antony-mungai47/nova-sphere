import React from "react";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { SuccessClient } from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <SuccessClient />
    </>
  );
}
