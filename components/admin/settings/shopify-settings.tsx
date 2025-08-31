"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const shopifyFormSchema = z.object({
  shopifyStoreUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  shopifyApiKey: z.string().min(1, {
    message: "API key is required.",
  }),
  shopifyApiSecretKey: z.string().min(1, {
    message: "API secret key is required.",
  }),
  shopifyAccessToken: z.string().min(1, {
    message: "Access token is required.",
  }),
  enableShopifySync: z.boolean().default(true),
  syncProducts: z.boolean().default(true),
  syncOrders: z.boolean().default(true),
  syncCustomers: z.boolean().default(true),
})

type ShopifyFormValues = z.infer<typeof shopifyFormSchema>

// This can come from your database or API
const defaultValues: Partial<ShopifyFormValues> = {
  shopifyStoreUrl: "https://your-store.myshopify.com",
  shopifyApiKey: "",
  shopifyApiSecretKey: "",
  shopifyAccessToken: "",
  enableShopifySync: true,
  syncProducts: true,
  syncOrders: true,
  syncCustomers: true,
}

export function ShopifySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const form = useForm<ShopifyFormValues>({
    resolver: zodResolver(shopifyFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ShopifyFormValues) {
    setIsLoading(true)

    try {
      // Here you would typically save the data to your database
      console.log("Form submitted:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsConnected(true)

      toast({
        title: "Shopify settings updated",
        description: "Your Shopify integration settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Shopify settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Integration</CardTitle>
        <CardDescription>Connect your Shopify store to sync products, orders, and customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">✓ Connected to Shopify</p>
            <p className="text-green-700 text-sm mt-1">Your Shopify store is connected and syncing data.</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="shopifyStoreUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shopify Store URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-store.myshopify.com" {...field} />
                  </FormControl>
                  <FormDescription>The URL of your Shopify store.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopifyApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter API key" {...field} />
                  </FormControl>
                  <FormDescription>Your Shopify API key from the Shopify admin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopifyApiSecretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter API secret key" {...field} />
                  </FormControl>
                  <FormDescription>Your Shopify API secret key from the Shopify admin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopifyAccessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter access token" {...field} />
                  </FormControl>
                  <FormDescription>Your Shopify access token from the Shopify admin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sync Settings</h3>

              <FormField
                control={form.control}
                name="enableShopifySync"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Shopify Sync</FormLabel>
                      <FormDescription>Enable automatic syncing between your app and Shopify.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="syncProducts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sync Products</FormLabel>
                      <FormDescription>Sync products between your app and Shopify.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("enableShopifySync")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="syncOrders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sync Orders</FormLabel>
                      <FormDescription>Sync orders between your app and Shopify.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("enableShopifySync")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="syncCustomers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sync Customers</FormLabel>
                      <FormDescription>Sync customers between your app and Shopify.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("enableShopifySync")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isConnected ? "Update Connection" : "Connect to Shopify"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
