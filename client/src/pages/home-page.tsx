import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Listing, NEIGHBORHOODS, FILTER_OPTIONS } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, MapPin, Ruler, BedDouble, Clock } from "lucide-react";
import FilterSidebar from "@/components/layout/sidefilter";

// Multi-choice options for query building
const MULTI_OPTIONS = ["yes", "no", "not mentioned"];

/**
 * Helper: Parse the URL query string into our filters object.
 */
function parseFilters(queryString) {
  const params = new URLSearchParams(queryString);
  return {
    minPrice: Number(params.get("minPrice")) || 0,
    maxPrice: Number(params.get("maxPrice")) || 10000,
    minSize: Number(params.get("minSize")) || 0,
    maxSize: Number(params.get("maxSize")) || 500,
    minRooms: Number(params.get("minRooms")) || 0,
    maxRooms: Number(params.get("maxRooms")) || 10,
    neighborhoods: params.getAll("neighborhoods"),
    balcony: params.getAll("balcony"),
    parking: params.getAll("parking"),
    furnished: params.getAll("furnished"),
    agent: params.getAll("agent"),
    // New boolean filters – default to true if not set.
    includeZeroPrice: params.get("includeZeroPrice") === "false" ? false : true,
    includeZeroSize: params.get("includeZeroSize") === "false" ? false : true,
    includeZeroRooms: params.get("includeZeroRooms") === "false" ? false : true,
  };
}

/**
 * Helper: Stringify the filters object into a query string.
 */
function stringifyFilters(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val) => params.append(key, val));
    } else {
      params.set(key, value.toString());
    }
  });
  return params.toString();
}

/**
 * Fetch listings with the current filters.
 */
async function fetchListings({ queryKey }: { queryKey: [string, any] }) {
  const [baseUrl, filters] = queryKey;
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (key === "neighborhoods") {
        // Always add neighborhoods if at least one is selected.
        if (value.length > 0) {
          value.forEach((v) => params.append(key, v));
        }
      } else {
        // For multi-choice fields, only add if not all options are selected.
        if (value.length > 0 && value.length < MULTI_OPTIONS.length) {
          value.forEach((v) => params.append(key, v));
        }
      }
    } else if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const url = `${baseUrl}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error fetching listings");
  }
  return res.json();
}

/**
 * Convert a created_at date into a "time ago" string in Hebrew.
 */
function timeAgo(createdAt: string) {
  const date = new Date(createdAt);
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return "בשעה האחרונה";
  } else if (diffHours < 24) {
    return `לפני ${Math.floor(diffHours)} שעות`;
  } else {
    return `לפני ${Math.floor(diffHours / 24)} ימים`;
  }
}

export default function HomePage() {
  const [location, setLocation] = useLocation();

  // Parse initial filters from the URL on mount.
  const initialFilters = useMemo(() => {
    const queryString = window.location.search.substring(1);
    return parseFilters(queryString);
  }, []);

  // Initialize filters state (including new booleans).
  const [filters, setFilters] = useState({
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 10000,
    minSize: initialFilters.minSize || 0,
    maxSize: initialFilters.maxSize || 500,
    minRooms: initialFilters.minRooms || 0,
    maxRooms: initialFilters.maxRooms || 10,
    neighborhoods: initialFilters.neighborhoods || [],
    balcony:
      initialFilters.balcony && initialFilters.balcony.length > 0
        ? initialFilters.balcony
        : [...MULTI_OPTIONS],
    parking:
      initialFilters.parking && initialFilters.parking.length > 0
        ? initialFilters.parking
        : [...MULTI_OPTIONS],
    furnished:
      initialFilters.furnished && initialFilters.furnished.length > 0
        ? initialFilters.furnished
        : [...MULTI_OPTIONS],
    agent:
      initialFilters.agent && initialFilters.agent.length > 0
        ? initialFilters.agent
        : [...MULTI_OPTIONS],
    includeZeroPrice: initialFilters.includeZeroPrice, // defaults to true
    includeZeroSize: initialFilters.includeZeroSize,
    includeZeroRooms: initialFilters.includeZeroRooms,
  });

  // Update the URL and sessionStorage whenever filters change.
  useEffect(() => {
    const queryString = stringifyFilters(filters);
    sessionStorage.setItem("filtersQuery", queryString);
    setLocation(`?${queryString}`, { replace: false });
  }, [filters, setLocation]);

  // When the user navigates via browser history, update the filters state from the URL.
  useEffect(() => {
    const queryString = window.location.search.substring(1);
    const newFilters = parseFilters(queryString);
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
    }
  }, [location]);

  const { data: listings, isLoading } = useQuery({
    queryKey: ["/api/listings", filters],
    queryFn: fetchListings,
  });

  return (
    <div className="min-h-screen bg-background ">
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-14 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          דירות להשכרה בתל אביב
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-start text-primary">
              הגדירו פילטרים ומצאו את הדירה שלכם
            </h2>
            <FilterSidebar onChange={setFilters} initialFilters={filters} />
          </div>

          {/* Listings Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))
                : listings?.map((listing: Listing) => (
                    <Link key={listing.id} href={`/listing/${listing.post_id}`}>
                      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-muted">
                          {listing.attachments?.[0] ? (
                            <img
                              src={
                                listing.source_platform === "facebook" &&
                                listing.attachments[1]
                                  ? listing.attachments[1]
                                  : listing.attachments[0]
                              }
                              alt={listing.description}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <Home className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            {listing.source_platform === "facebook" ? (
                              <img
                                src="/facebook-logo.png"
                                alt="Facebook Logo"
                                className="w-8 h-8 rounded-full"
                              />
                            ) : listing.source_platform === "yad2" ? (
                              <img
                                src="/yad2-logo.jpg"
                                alt="Yad2 Logo"
                                className="w-8 h-8 rounded-full"
                              />
                            ) : null}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {listing.description}
                          </h3>
                          <div className="text-xl font-bold mb-4">
                            <div>
                              ₪
                              {Number(listing.price).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                              {listing.street &&
                                listing.street !== "לא צוין" &&
                                listing.street !== "not mentioned" && (
                                  <span className="ml-2 text-sm mr-2">
                                    {listing.street}
                                  </span>
                                )}
                              {listing.house &&
                                listing.house !== "לא צוין" &&
                                listing.house !== "not mentioned" && (
                                  <span className="ml-2 text-sm">
                                    {listing.house}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="w-full bg-white rounded-md shadow-sm py-3 flex items-center justify-between">
                            <div className="flex-1 flex flex-col items-center px-1 text-center">
                              <MapPin className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium text-gray-700">
                                {listing.neighborhood}
                              </span>
                            </div>
                            <div className="w-px h-8 bg-gray-300 mx-2" />
                            <div className="flex-1 flex flex-col items-center px-1 text-center">
                              <Ruler className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium text-gray-700">
                                {Number(listing.size).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}{" "}
                                מ״ר
                              </span>
                            </div>
                            <div className="w-px h-8 bg-gray-300 mx-2" />
                            <div className="flex-1 flex flex-col items-center px-1 text-center">
                              <BedDouble className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium text-gray-700">
                                {Number(listing.num_rooms).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 },
                                )}{" "}
                                חדרים
                              </span>
                            </div>
                            <div className="w-px h-8 bg-gray-300 mx-2" />
                            <div className="flex-1 flex flex-col items-center px-1 text-center">
                              <Clock className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium text-gray-700">
                                {timeAgo(listing.created_at)}
                              </span>
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
    </div>
  );
}
