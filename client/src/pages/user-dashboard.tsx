import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserFilter, userFilterSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's current filters
  const { data: filters, isLoading: filtersLoading } = useQuery<UserFilter[]>({
    queryKey: ["/api/user/filters"],
  });

  // Subscription mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/subscribe");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription activated",
        description: "You can now receive notifications via Telegram",
      });
    },
  });

  // Telegram chat ID mutation
  const telegramMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const res = await apiRequest("POST", "/api/user/telegram", { chatId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Telegram connected",
        description: "You will now receive notifications via Telegram",
      });
    },
  });

  // Filter creation mutation
  const createFilterMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/user/filters", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/filters"] });
      toast({
        title: "Filter created",
        description: "Your new filter has been saved",
      });
      form.reset();
    },
  });

  // Filter deletion mutation
  const deleteFilterMutation = useMutation({
    mutationFn: async (filterId: number) => {
      await apiRequest("DELETE", `/api/user/filters/${filterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/filters"] });
      toast({
        title: "Filter deleted",
        description: "The filter has been removed",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(userFilterSchema),
    defaultValues: {
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      minRooms: undefined,
      maxRooms: undefined,
      neighborhoods: [],
      balcony: undefined,
      agent: undefined,
      parking: undefined,
      furnished: undefined,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createFilterMutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Management */}
          <Card className="md:col-span-1">
            <CardHeader className="font-semibold">Subscription</CardHeader>
            <CardContent className="space-y-4">
              {!user?.isSubscribed ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe to receive notifications for new listings that
                    match your filters
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => subscribeMutation.mutate()}
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Status</div>
                    <div className="text-sm text-green-500">Active</div>
                  </div>
                  {!user.telegramChatId && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Connect your Telegram to receive notifications
                      </p>
                      <Input
                        placeholder="Telegram Chat ID"
                        onBlur={(e) => telegramMutation.mutate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filter Management */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="font-semibold">
                Create New Filter
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Size (m²)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Size (m²)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minRooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Rooms</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxRooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Rooms</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="balcony"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Balcony</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Any" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parking</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Any" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createFilterMutation.isPending}
                    >
                      {createFilterMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create Filter"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Existing Filters */}
            <Card>
              <CardHeader className="font-semibold">Your Filters</CardHeader>
              <CardContent>
                {filtersLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filters?.length === 0 ? (
                  <div className="text-center text-muted-foreground p-4">
                    No filters created yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filters?.map((filter) => (
                      <Card key={filter.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                €{filter.minPrice} - €{filter.maxPrice}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {filter.minSize}m² - {filter.maxSize}m² •{" "}
                                {filter.minRooms} - {filter.maxRooms} rooms
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Filter
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this filter?
                                    You will no longer receive notifications for
                                    matching listings.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteFilterMutation.mutate(filter.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
