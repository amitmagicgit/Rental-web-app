import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Listing } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Home, MapPin, Ruler, BedDouble, Car, X } from "lucide-react";

export default function HomePage() {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minSize: 0,
    maxSize: 500,
    minRooms: 0,
    maxRooms: 10,
    neighborhood: '',
    balcony: '',
    parking: '',
    furnished: '',
    agent: ''
  });

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings', filters],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="font-semibold">Filters</CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({...f, minPrice: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({...f, maxPrice: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Size (m²)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min"
                    value={filters.minSize}
                    onChange={(e) => setFilters(f => ({...f, minSize: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max"
                    value={filters.maxSize}
                    onChange={(e) => setFilters(f => ({...f, maxSize: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Rooms</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min"
                    value={filters.minRooms}
                    onChange={(e) => setFilters(f => ({...f, minRooms: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max"
                    value={filters.maxRooms}
                    onChange={(e) => setFilters(f => ({...f, maxRooms: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <Select
                  value={filters.balcony}
                  onValueChange={(value) => setFilters(f => ({...f, balcony: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Balcony" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.parking}
                  onValueChange={(value) => setFilters(f => ({...f, parking: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Parking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.furnished}
                  onValueChange={(value) => setFilters(f => ({...f, furnished: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Furnished" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.agent}
                  onValueChange={(value) => setFilters(f => ({...f, agent: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : listings?.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.postId}`}>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {listing.description}
                    </h3>
                    <div className="text-xl font-bold mb-2">
                      €{listing.price?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.neighborhood}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        {listing.size}m²
                      </div>
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {listing.numRooms}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}