import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Listing, NEIGHBORHOODS, FILTER_OPTIONS } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Home, MapPin, Ruler, BedDouble } from "lucide-react";

export default function HomePage() {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minSize: 0,
    maxSize: 500,
    minRooms: 0,
    maxRooms: 10,
    neighborhoods: [] as string[],
    balcony: FILTER_OPTIONS.ANY,
    parking: FILTER_OPTIONS.ANY,
    furnished: FILTER_OPTIONS.ANY,
    agent: FILTER_OPTIONS.ANY
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
            <CardHeader className="font-semibold">סינון</CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">טווח מחירים</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="מקסימום"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({...f, maxPrice: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="מינימום"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(f => ({...f, minPrice: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">גודל (מ״ר)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="מקסימום"
                    value={filters.maxSize}
                    onChange={(e) => setFilters(f => ({...f, maxSize: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="מינימום"
                    value={filters.minSize}
                    onChange={(e) => setFilters(f => ({...f, minSize: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">חדרים</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="מקסימום"
                    value={filters.maxRooms}
                    onChange={(e) => setFilters(f => ({...f, maxRooms: Number(e.target.value)}))}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="מינימום"
                    value={filters.minRooms}
                    onChange={(e) => setFilters(f => ({...f, minRooms: Number(e.target.value)}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">שכונות</label>
                <div className="grid grid-cols-2 gap-2">
                  {NEIGHBORHOODS.map((neighborhood) => (
                    <div key={neighborhood} className="flex items-center space-x-2">
                      <Checkbox
                        id={neighborhood}
                        checked={filters.neighborhoods.includes(neighborhood)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(f => ({
                              ...f,
                              neighborhoods: [...f.neighborhoods, neighborhood]
                            }));
                          } else {
                            setFilters(f => ({
                              ...f,
                              neighborhoods: f.neighborhoods.filter(n => n !== neighborhood)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={neighborhood} className="text-sm">
                        {neighborhood}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">מאפיינים</label>
                <Select
                  value={filters.balcony}
                  onValueChange={(value) => setFilters(f => ({...f, balcony: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="מרפסת" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_OPTIONS.ANY}>הכל</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.YES}>כן</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NO}>לא</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NOT_MENTIONED}>לא צוין</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.parking}
                  onValueChange={(value) => setFilters(f => ({...f, parking: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="חניה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_OPTIONS.ANY}>הכל</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.YES}>כן</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NO}>לא</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NOT_MENTIONED}>לא צוין</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.furnished}
                  onValueChange={(value) => setFilters(f => ({...f, furnished: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="מרוהט" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_OPTIONS.ANY}>הכל</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.YES}>כן</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NO}>לא</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NOT_MENTIONED}>לא צוין</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.agent}
                  onValueChange={(value) => setFilters(f => ({...f, agent: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="תיווך" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_OPTIONS.ANY}>הכל</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.YES}>כן</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NO}>לא</SelectItem>
                    <SelectItem value={FILTER_OPTIONS.NOT_MENTIONED}>לא צוין</SelectItem>
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
                      ₪{listing.price?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.neighborhood}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        {listing.size} מ״ר
                      </div>
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {listing.numRooms} חדרים
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