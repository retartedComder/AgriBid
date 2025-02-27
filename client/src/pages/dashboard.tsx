import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Contract, Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart, Package, ShoppingCart, Users } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const stats = [
    {
      title: "Active Contracts",
      value: contracts?.filter((c) => c.status === "pending").length || 0,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
    },
    {
      title: "Revenue",
      value: `$${contracts?.reduce((acc, c) => acc + Number(c.price), 0) || 0}`,
      icon: BarChart,
    },
    {
      title: "Connected Users",
      value: contracts?.filter((c) => 
        user?.role === "farmer" ? c.buyerId : c.farmerId
      ).length || 0,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts?.slice(0, 5).map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium">Contract #{contract.id}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {contract.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${contract.price}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {contract.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Link href="/products">
                <Button className="w-full">
                  {user?.role === "farmer" ? "List New Product" : "Browse Products"}
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                View Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
