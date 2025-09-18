import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-6xl font-heading font-bold text-primary mb-4">
              404
            </h1>
            <h2 className="text-2xl font-heading font-semibold mb-4">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              might have been moved, deleted, or the URL might be incorrect.
            </p>
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Link href="/shop" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
