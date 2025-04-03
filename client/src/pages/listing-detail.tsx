import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Listing } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  MapPin,
  Ruler,
  BedDouble,
  Check,
  X,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NetworkAnimation } from "@/components/NetworkAnimation";

// Shared helper to convert created_at to a time-ago string.
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

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:postId");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [backText, setBackText] = useState("חזרה לחיפוש");

  // Determine if history exists (if not, we'll navigate to the root).
  useEffect(() => {
    if (window.history.length <= 2 || document.referrer === "") {
      setBackText("חפשו עוד דירות");
    } else {
      setBackText("חזרה לחיפוש");
    }
  }, []);

  const handleBack = () => {
    if (window.history.length <= 2 || document.referrer === "") {
      window.location.href = "/";
    } else {
      window.history.back();
    }
  };

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${params?.postId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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

  const hasAttachments = listing.attachments && listing.attachments.length > 0;
  const mainImageIndex = hasAttachments
    ? listing.source_platform === "facebook" &&
      selectedImageIndex === 0 &&
      listing.attachments[1]
      ? 1
      : selectedImageIndex
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <NetworkAnimation
        desktopHouses={5}
        desktopPeople={5}
        mobileHouses={4}
        mobilePeople={3}
      />
      <div className="container mx-auto p-12 pt-32 space-y-8">
        {/* Back Button */}
        <Button onClick={handleBack} className="mb-4">
          {backText}
        </Button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Details */}
          <div className="w-full md:w-1/2 flex flex-col space-y-4">
            {/* Title */}
            <h1 className="text-2xl font-bold">{listing.description}</h1>
            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              ₪
              {Number(listing.price).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            {/* Address, Size, Rooms, and Timing */}
            <div className="flex flex-wrap gap-4 pt-6 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                <span>{listing.neighborhood}</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler className="h-5 w-5" />
                <span>
                  {Number(listing.size).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  מ״ר
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BedDouble className="h-5 w-5" />
                <span>
                  {Number(listing.num_rooms).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  חדרים
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{timeAgo(listing.created_at)}</span>
              </div>
            </div>
            {/* Detailed Description */}
            <div className="prose max-w-none border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">תיאור</h2>
              <p className="whitespace-pre-wrap">
                {listing.detailed_description}
              </p>
            </div>
            {/* Features */}
            <div className="grid grid-cols-2 gap-2 border-t pb-5 border-b pt-4">
              {[
                { label: "תיווך", value: listing.agent },
                { label: "מרפסת", value: listing.balcony },
                { label: "חניה", value: listing.parking },
                { label: "מרוהט", value: listing.furnished },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  {feature.value === "yes" ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
            {/* External Link Card */}
            <div className="flex justify-center">
              <Card className="w-full md:w-1/2 h-fit relative">
                <CardContent className="p-6 flex flex-col">
                  <Button className="w-full mb-4" asChild>
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      צפה במודעה המקורית
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
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="w-full md:w-1/2 space-y-4">
            {hasAttachments ? (
              <>
                <div className="w-full aspect-[3/2] relative rounded-lg overflow-hidden shadow-md">
                  <img
                    src={listing.attachments[mainImageIndex]}
                    alt={`Property image ${mainImageIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
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
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {listing.attachments.map((imageUrl, index) => {
                    // Skip the first attachment for Facebook source.
                    if (listing.source_platform === "facebook" && index === 0)
                      return null;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative rounded-md overflow-hidden border-2 border-primary ${
                          index === selectedImageIndex
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-200 rounded-lg">
                <span className="text-muted-foreground">
                  No images available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
