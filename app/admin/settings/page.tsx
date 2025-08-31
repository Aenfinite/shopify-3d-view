import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/admin/settings/general-settings"
import { ShopifySettings } from "@/components/admin/settings/shopify-settings"
import { MeasurementSettings } from "@/components/admin/settings/measurement-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="shopify" className="space-y-4">
          <ShopifySettings />
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <MeasurementSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
