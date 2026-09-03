import { StoreSettingsRepository } from "@/domains/Admin/settings/repositories/storeSettings.repository";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default async function PressPage() {
  const settings = await StoreSettingsRepository.findFirst();

  return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] py-20 px-4">
        <EmptyState 
          icon={<Globe />}
          title="Press & Media"
          description="Our press kit and media resources are currently being updated. For media inquiries, please reach out via our contact page."
          action={
            <Button >
              <Link href="/contact">Contact Media Relations</Link>
            </Button>
          }
        />
      </main>
    
  );
}
