import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TranslationEditor } from "@/components/admin/translations/translation-editor"

export default function TranslationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Translations</h1>
        <p className="text-muted-foreground">Manage translations for your application.</p>
      </div>

      <Tabs defaultValue="interface" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="interface" className="space-y-4">
          <TranslationEditor section="interface" />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <TranslationEditor section="products" />
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <TranslationEditor section="emails" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
