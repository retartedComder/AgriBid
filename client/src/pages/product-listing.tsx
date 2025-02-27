import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isFarmer = user?.role === "farmer";

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProduct = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: "",
      unit: "",
      price: "",
    },
  });

  const createContract = useMutation({
    mutationFn: async (productId: number) => {
      const product = products?.find(p => p.id === productId);
      if (!product) throw new Error("Product not found");

      const res = await apiRequest("POST", "/api/contracts", {
        productId,
        quantity: product.quantity,
        price: product.price,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create contract");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contract created",
        description: "The contract has been sent to the farmer for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create contract",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          {isFarmer && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>List New Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Product Listing</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => createProduct.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="kg, ton, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createProduct.isPending}
                    >
                      {createProduct.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Listing
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        {product.quantity} {product.unit} available
                      </CardDescription>
                    </div>
                    <Badge variant={product.status === "available" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">${product.price}</span>
                    {!isFarmer && product.status === "available" && (
                      <Button
                        onClick={() => createContract.mutate(product.id)}
                        disabled={createContract.isPending}
                      >
                        {createContract.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="mr-2 h-4 w-4" />
                        )}
                        Create Contract
                      </Button>
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