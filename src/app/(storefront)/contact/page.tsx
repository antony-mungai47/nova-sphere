import { StoreSettingsRepository } from "@/domains/Admin/settings/repositories/storeSettings.repository";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";

export default async function ContactPage() {
  const settings = await StoreSettingsRepository.findFirst();

  return (
      <main className="flex-1 min-h-[70vh] py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-[var(--text-h2)] font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-[var(--text-body)] text-muted max-w-2xl mx-auto">
            Have a question about a product, order, or just want to say hello? Our team is ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card variant="default">
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Email</h3>
                    <p className="text-[var(--text-small)] text-muted mb-2">Our friendly team is here to help.</p>
                    <a href={`mailto:${settings?.supportEmail || "support@novasphere.com"}`} className="text-accent hover:underline font-medium">
                      {settings?.supportEmail || "support@novasphere.com"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Phone</h3>
                    <p className="text-[var(--text-small)] text-muted mb-2">Mon-Fri from 8am to 5pm.</p>
                    <a href={`tel:${settings?.businessPhone || "+1 (555) 000-0000"}`} className="text-accent hover:underline font-medium">
                      {settings?.businessPhone || "+1 (555) 000-0000"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Office</h3>
                    <p className="text-[var(--text-small)] text-muted mb-2">Come say hello at our headquarters.</p>
                    <p className="text-primary font-medium">
                      100 Innovation Drive<br />
                      Tech District<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="First name" placeholder="Jane" />
                    <Input label="Last name" placeholder="Doe" />
                  </div>
                  <Input label="Email" type="email" placeholder="jane@example.com" />
                  <Input label="Subject" placeholder="How can we help?" />
                  
                  <div className="flex flex-col space-y-[var(--space-2)]">
                    <label className="text-[var(--text-small)] font-medium text-secondary">
                      Message
                    </label>
                    <textarea 
                      className="flex w-full rounded-[var(--radius-md)] border border-border-default bg-surface-sunken px-3 py-2 text-[var(--text-body)] text-foreground placeholder:text-muted transition-colors focus-ring min-h-[120px] resize-y"
                      placeholder="Leave us a message..."
                    ></textarea>
                  </div>
                  
                  <Button type="button" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    
  );
}
