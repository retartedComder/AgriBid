import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, MessageCircle, FileText, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AgriBid</h1>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard">
              <a className="text-primary-foreground hover:opacity-80">Dashboard</a>
            </Link>
            <Link href="/products">
              <a className="text-primary-foreground hover:opacity-80">Products</a>
            </Link>
            <Link href="/contracts">
              <a className="text-primary-foreground hover:opacity-80">Contracts</a>
            </Link>
            <Link href="/messages">
              <a className="text-primary-foreground hover:opacity-80">Messages</a>
            </Link>
            <div className="flex items-center gap-4 ml-4">
              <span>Welcome, {user?.fullName}</span>
              <Button
                variant="secondary"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Welcome to AgriBid Marketplace
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect with {user?.role === "farmer" ? "buyers" : "farmers"} and
              grow your agricultural business.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="w-full flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Products
                </Button>
              </Link>
              <Link href="/messages">
                <Button size="lg" variant="outline" className="w-full flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </Button>
              </Link>
              <Link href="/contracts">
                <Button size="lg" variant="outline" className="w-full flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contracts
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef"
              alt="Farm landscape"
              className="rounded-lg shadow-md w-full h-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1611864581049-aca018410b97"
              alt="Agricultural products"
              className="rounded-lg shadow-md w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
}