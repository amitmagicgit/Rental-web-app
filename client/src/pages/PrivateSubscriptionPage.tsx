import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEIGHBORHOODS } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NetworkAnimation } from "@/components/NetworkAnimation";

const MULTI_OPTIONS = ["yes", "no", "not mentioned"];

function translateOption(option: string) {
  if (option === "yes") return "כן";
  if (option === "no") return "לא";
  if (option === "not mentioned") return "לא צויין";
  return option;
}

function PrivateSubscriptionPage() {
  const [location] = useLocation();
  const [chatId, setChatId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [optionalChatId, setOptionalChatId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [paramsLoaded, setParamsLoaded] = useState<boolean>(false);
  const { toast } = useToast();

  // Filter states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [minSize, setMinSize] = useState<number>(0);
  const [maxSize, setMaxSize] = useState<number>(200);
  const [minRooms, setMinRooms] = useState<number>(0);
  const [maxRooms, setMaxRooms] = useState<number>(5);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Multi-choice fields (default: all selected)
  const [balcony, setBalcony] = useState<string[]>([...MULTI_OPTIONS]);
  const [agent, setAgent] = useState<string[]>([...MULTI_OPTIONS]);
  const [parking, setParking] = useState<string[]>([...MULTI_OPTIONS]);
  const [furnished, setFurnished] = useState<string[]>([...MULTI_OPTIONS]);

  // Booleans for including zero values
  const [includeZeroPrice, setIncludeZeroPrice] = useState<boolean>(true);
  const [includeZeroSize, setIncludeZeroSize] = useState<boolean>(true);
  const [includeZeroRooms, setIncludeZeroRooms] = useState<boolean>(true);

  // Errors for multi-choice fields.
  const [errors, setErrors] = useState({
    balcony: "",
    agent: "",
    parking: "",
    furnished: "",
    neighborhoods: "",
  });

  // Extract query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatIdParam = params.get("chat_id");
    const tokenParam = params.get("token");
    const optionalChatIdParam = params.get("ci");
    
    if (chatIdParam) setChatId(chatIdParam);
    if (tokenParam) setToken(tokenParam);
    if (optionalChatIdParam) setOptionalChatId(optionalChatIdParam);
    setParamsLoaded(true);
  }, [location]);

  // Fetch existing subscription preferences using chatId and token
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch(
          `/api/telegram/private-subscription?chat_id=${chatId}&token=${token}`,
        );
        if (res.ok) {
          const data = await res.json();
          setMinPrice(data.min_price);
          setMaxPrice(data.max_price);
          setMinSize(data.min_size);
          setMaxSize(data.max_size);
          setMinRooms(data.min_rooms);
          setMaxRooms(data.max_rooms);
          setNeighborhoods(data.neighborhoods || []);
          setBalcony(data.balcony || [...MULTI_OPTIONS]);
          setAgent(data.agent || [...MULTI_OPTIONS]);
          setParking(data.parking || [...MULTI_OPTIONS]);
          setFurnished(data.furnished || [...MULTI_OPTIONS]);
          setIncludeZeroPrice(data.include_zero_price);
          setIncludeZeroSize(data.include_zero_size);
          setIncludeZeroRooms(data.include_zero_rooms);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setIsFetching(false);
      }
    }
    // Only fetch if parameters are loaded and we have both chatId and token
    if (paramsLoaded && chatId && token) {
      fetchSubscription();
    } else if (paramsLoaded) {
      setIsFetching(false);
    }
  }, [paramsLoaded, chatId, token]);

  // Generic toggle function for multi-choice fields.
  const toggleFieldOption = (
    field: "balcony" | "agent" | "parking" | "furnished",
    option: string,
  ) => {
    const update = (
      current: string[],
      setter: (v: string[]) => void,
      fieldName: string,
    ) => {
      if (current.includes(option)) {
        if (current.length === 1) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: "צריך לבחור לפחות אופציה אחת על מנת לקבל תוצאות",
          }));
          return;
        }
        setter(current.filter((o) => o !== option));
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      } else {
        setter([...current, option]);
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      }
    };

    if (field === "balcony") update(balcony, setBalcony, "balcony");
    else if (field === "parking") update(parking, setParking, "parking");
    else if (field === "furnished")
      update(furnished, setFurnished, "furnished");
    else if (field === "agent") update(agent, setAgent, "agent");
  };

  // Render function for multi-choice fields as a group of checkboxes.
  const renderMultiChoiceField = (
    label: string,
    field: "balcony" | "parking" | "furnished" | "agent",
    current: string[],
    toggleFn: (option: string) => void,
    error: string,
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4 mt-1">
        {MULTI_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-1">
            <input
              type="checkbox"
              className="accent-primary"
              checked={current.includes(option)}
              onChange={() => toggleFn(option)}
            />
            <span className="text-sm">{translateOption(option)}</span>
          </label>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );

  const toggleNeighborhood = (n: string) => {
    setNeighborhoods((current) =>
      current.includes(n) ? current.filter((x) => x !== n) : [...current, n],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate neighborhoods
    if (neighborhoods.length === 0) {
      setErrors(prev => ({
        ...prev,
        neighborhoods: "יש לבחור לפחות שכונה אחת"
      }));
      return;
    }

    setLoading(true);

    const body = {
      chatId,
      token,
      targetType: "user",
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      neighborhoods,
      minRooms,
      maxRooms,
      balcony,
      agent,
      parking,
      furnished,
      includeZeroPrice,
      includeZeroSize,
      includeZeroRooms,
    };

    try {
      const res = await fetch("/api/telegram/private-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("Failed to save subscription");
      }
      await res.json();

      await fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: "הגדרות הסינון נשמרו. מעכשיו תתחילו לקבל הודעות בטלגרם!",
        }),
      });

      toast({
        title: "הגדרות נשמרו",
        description: "מעכשיו תתחילו לקבל הודעות בטלגרם",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "שגיאה",
        description: "התרחשה שגיאה בשמירת ההגדרות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      <NetworkAnimation 
        desktopHouses={8}
        desktopPeople={8}
        mobileHouses={5}
        mobilePeople={5}
      />
      <main className="flex-grow flex items-center justify-center p-4 py-28 relative z-10">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold">בחר פילטרים לבוט האישי</h2>
          </CardHeader>
          {/* Set a fixed minimum height to preserve layout */}
          <CardContent className="min-h-[500px]">
            {isFetching || !paramsLoaded ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Price Range */}
                <div>
                  <label className="block mb-1 font-semibold">מחיר</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="מינימום"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="מקסימום"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                    />
                  </div>
                  <label className="flex items-center gap-1 mt-1">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={includeZeroPrice}
                      onChange={(e) => setIncludeZeroPrice(e.target.checked)}
                    />
                    <span className="text-sm">אפשר לכלול דירות ללא מחיר</span>
                  </label>
                </div>

                {/* Size Range */}
                <div>
                  <label className="block mb-1 font-semibold">גודל מ"ר</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="מינימום"
                      value={minSize}
                      onChange={(e) => setMinSize(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="מקסימום"
                      value={maxSize}
                      onChange={(e) => setMaxSize(Number(e.target.value))}
                    />
                  </div>
                  <label className="flex items-center gap-1 mt-1">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={includeZeroSize}
                      onChange={(e) => setIncludeZeroSize(e.target.checked)}
                    />
                    <span className="text-sm">אפשר לכלול דירות ללא גודל</span>
                  </label>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block mb-1 font-semibold">חדרים</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="מינימום"
                      value={minRooms}
                      onChange={(e) => setMinRooms(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="מקסימום"
                      value={maxRooms}
                      onChange={(e) => setMaxRooms(Number(e.target.value))}
                    />
                  </div>
                  <label className="flex items-center gap-1 mt-1">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={includeZeroRooms}
                      onChange={(e) => setIncludeZeroRooms(e.target.checked)}
                    />
                    <span className="text-sm">
                      אפשר לכלול דירות ללא מספר חדרים
                    </span>
                  </label>
                </div>

                {/* Neighborhoods */}
                <div>
                  <label className="block mb-1 font-medium">שכונות</label>
                  <div className="flex flex-wrap gap-2">
                    {NEIGHBORHOODS.map((n) => (
                      <label key={n} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={neighborhoods.includes(n)}
                          onChange={() => {
                            setNeighborhoods((curr) =>
                              curr.includes(n)
                                ? curr.filter((x) => x !== n)
                                : [...curr, n],
                            );
                            // Clear error when user makes a selection
                            setErrors(prev => ({
                              ...prev,
                              neighborhoods: ""
                            }));
                          }}
                        />
                        <span>{n}</span>
                      </label>
                    ))}
                  </div>
                  {errors.neighborhoods && (
                    <div className="text-red-500 text-sm mt-1">{errors.neighborhoods}</div>
                  )}
                </div>

                {/* Multi-choice Fields */}
                {renderMultiChoiceField(
                  "מרפסת",
                  "balcony",
                  balcony,
                  (option) => toggleFieldOption("balcony", option),
                  errors.balcony,
                )}
                {renderMultiChoiceField(
                  "חניה",
                  "parking",
                  parking,
                  (option) => toggleFieldOption("parking", option),
                  errors.parking,
                )}
                {renderMultiChoiceField(
                  "מרוהט",
                  "furnished",
                  furnished,
                  (option) => toggleFieldOption("furnished", option),
                  errors.furnished,
                )}
                {renderMultiChoiceField(
                  "תיווך",
                  "agent",
                  agent,
                  (option) => toggleFieldOption("agent", option),
                  errors.agent,
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "שמור פילטרים"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default PrivateSubscriptionPage;
