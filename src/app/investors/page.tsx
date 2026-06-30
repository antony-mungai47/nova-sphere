import { StoreSettingsRepository } from "@/domains/Admin/settings/repositories/storeSettings.repository";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { TrendingUp } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default async function InvestorsPage() {
  const settings = await StoreSettingsRepository.findFirst();

  return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] py-20 px-4">
        <EmptyState 
          icon={<TrendingUp />}
          title="Investor Relations"
          description="Nova Sphere is privately held. For investment opportunities or financial inquiries, please connect with our corporate development team."
          action={
            <Button >
              <Link href="/contact">Contact Corporate</Link>
            </Button>
          }
        />
      </main>
    
  );
}
