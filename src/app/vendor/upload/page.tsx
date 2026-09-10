import React from 'react';
import { VendorUploadForm } from '@/domains/Commerce/vendor/components/VendorUploadForm';
import { IdentityFacade } from '@/modules/identity/IdentityFacade';
import { redirect } from 'next/navigation';

export default async function VendorUploadPage() {
  const isVendor = await IdentityFacade.isVendor();
  const isAdmin = await IdentityFacade.isAdmin();
  
  if (!isVendor && !isAdmin) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <VendorUploadForm />
    </div>
  );
}
