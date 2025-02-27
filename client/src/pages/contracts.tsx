import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ContractsPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";

  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const updateContract = useMutation({
    mutationFn: async ({ contractId, status }: { contractId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/contracts/${contractId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">My Contracts</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {contracts?.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Contract #{contract.id}</CardTitle>
                      <CardDescription>
                        {isFarmer ? "Buyer" : "Farmer"} ID: {isFarmer ? contract.buyerId : contract.farmerId}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{contract.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">${contract.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Date</p>
                        <p className="font-medium">
                          {new Date(contract.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created At</p>
                        <p className="font-medium">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {isFarmer && contract.status === "pending" && (
                      <div className="flex gap-4">
                        <Button
                          onClick={() =>
                            updateContract.mutate({
                              contractId: contract.id,
                              status: "accepted",
                            })
                          }
                          disabled={updateContract.isPending}
                        >
                          Accept Contract
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            updateContract.mutate({
                              contractId: contract.id,
                              status: "rejected",
                            })
                          }
                          disabled={updateContract.isPending}
                        >
                          Reject Contract
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
