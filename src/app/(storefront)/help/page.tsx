import { StoreSettingsRepository } from "@/domains/Admin/settings/repositories/storeSettings.repository";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { HelpCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default async function HelpPage() {
  const settings = await StoreSettingsRepository.findFirst();

  return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] py-20 px-4">
        <EmptyState 
          icon={<HelpCircle />}
          title="Help & Support"
          description="Our new help center is launching soon with detailed guides and FAQs. In the meantime, our support team is ready to assist you."
          action={
            <div className="flex gap-4">
              <Button >
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" >
                <Link href="/faq">View FAQs</Link>
              </Button>
            </div>
          }
        />
      </main>
    
  );
}
