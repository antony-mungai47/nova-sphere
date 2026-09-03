import { StoreSettingsRepository } from "@/domains/Admin/settings/repositories/storeSettings.repository";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Briefcase } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default async function CareersPage() {
  const settings = await StoreSettingsRepository.findFirst();

  return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] py-20 px-4">
        <EmptyState 
          icon={<Briefcase />}
          title="Careers at Nova Sphere"
          description="We are currently building the future of premium tech commerce. Check back soon for open positions across engineering, product, and design."
          action={
            <Button >
              <Link href="/">Back to Home</Link>
            </Button>
          }
        />
      </main>
    
  );
}
