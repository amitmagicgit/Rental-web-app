import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Listing } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Ruler, BedDouble, Car, Check, X } from "lucide-react";

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:postId");

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${params?.postId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Image */}
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center mb-8">
            <div className="text-muted-foreground text-center">
              <div className="text-lg">Property Image</div>
              <div className="text-sm">Contact agent for photos</div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold mb-4">{listing.description}</h1>
              <div className="text-3xl font-bold mb-4">
                €{listing.price?.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  {listing.neighborhood}
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="h-5 w-5" />
                  {listing.size}m²
                </div>
                <div className="flex items-center gap-1">
                  <BedDouble className="h-5 w-5" />
                  {listing.numRooms} rooms
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Button 
                  className="w-full mb-4"
                  asChild
                >
                  <a href={listing.url} target="_blank" rel="noopener noreferrer">
                    View Original Post
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <div className="text-sm text-muted-foreground">
                  View the original post for contact information and more details
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2">
              {listing.agent === 'yes' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span>Agent</span>
            </div>
            <div className="flex items-center gap-2">
              {listing.balcony === 'yes' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span>Balcony</span>
            </div>
            <div className="flex items-center gap-2">
              {listing.parking === 'yes' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span>Parking</span>
            </div>
            <div className="flex items-center gap-2">
              {listing.furnished === 'yes' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span>Furnished</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="whitespace-pre-wrap">{listing.detailedDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
