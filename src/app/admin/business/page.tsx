import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function BusinessDashboardPage() {
  // Aggregate Business Metrics
  const totalOrders = await prisma.order.count();
  const successfulOrders = await prisma.order.findMany({ where: { status: "DELIVERED" } });
  
  const gmv = successfulOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  const aov = successfulOrders.length > 0 ? gmv / successfulOrders.length : 0;
  
  const activeVendors = await prisma.tenant.count({ where: { status: "APPROVED" } });
  
  const openIncidents = await prisma.incident.count({ where: { status: "OPEN" } });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Executive Operations Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-black border-slate-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">Gross Merchandise Volume (GMV)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(gmv)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black border-slate-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">Average Order Value (AOV)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(aov)}</div>
          </CardContent>
        </Card>

        <Card className="bg-black border-slate-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">Active Verified Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{activeVendors}</div>
          </CardContent>
        </Card>

        <Card className={`bg-black border-slate-500/30 ${openIncidents > 0 ? 'border-red-500/50' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">Active P1 Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${openIncidents > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {openIncidents}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-slate-500/30">
          <CardHeader>
            <CardTitle>System Health & Latency</CardTitle>
          </CardHeader>
          <CardContent>
            {/* In a real app, this pulls from Datadog/Sentry metrics API */}
            <ul className="space-y-4">
              <li className="flex justify-between text-sm">
                <span className="text-slate-300">Checkout Engine P95</span>
                <span className="text-green-500">210ms</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-300">Search Index (Algolia) P95</span>
                <span className="text-green-500">45ms</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-300">Payment Gateway (Stripe) P95</span>
                <span className="text-yellow-500">420ms</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-300">AI Recommendations P95</span>
                <span className="text-green-500">310ms</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
