"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface Translation {
  key: string
  en: string
  [key: string]: string
}

interface TranslationEditorProps {
  section: "interface" | "products" | "emails"
}

export function TranslationEditor({ section }: TranslationEditorProps) {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ]

  useEffect(() => {
    async function fetchTranslations() {
      try {
        const translationsCollection = collection(db, "translations")
        const translationsSnapshot = await getDocs(translationsCollection)

        if (translationsSnapshot.empty) {
          // If no translations exist, create sample data
          const sampleTranslations = getSampleTranslations(section)
          setTranslations(sampleTranslations)
        } else {
          const translationsList = translationsSnapshot.docs
            .filter((doc) => doc.data().section === section)
            .map((doc) => ({
              key: doc.id,
              ...doc.data(),
            })) as Translation[]

          if (translationsList.length > 0) {
            setTranslations(translationsList)
          } else {
            // If no translations exist for this section, create sample data
            const sampleTranslations = getSampleTranslations(section)
            setTranslations(sampleTranslations)
          }
        }
      } catch (error) {
        console.error("Error fetching translations:", error)
        // If error, create sample data
        const sampleTranslations = getSampleTranslations(section)
        setTranslations(sampleTranslations)
      } finally {
        setLoading(false)
      }
    }

    fetchTranslations()
  }, [section])

  const handleTranslationChange = (index: number, value: string) => {
    const updatedTranslations = [...translations]
    updatedTranslations[index][selectedLanguage] = value
    setTranslations(updatedTranslations)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Here you would typically save the translations to your database
      for (const translation of translations) {
        await setDoc(doc(db, "translations", translation.key), {
          ...translation,
          section,
        })
      }

      toast({
        title: "Translations saved",
        description: "Your translations have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving translations:", error)
      toast({
        title: "Error",
        description: "Failed to save translations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading translations...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{section.charAt(0).toUpperCase() + section.slice(1)} Translations</span>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Edit translations for the {section} section in {languages.find((l) => l.code === selectedLanguage)?.name}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {translations.map((translation, index) => (
            <div key={translation.key} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{translation.key}</label>
                <Input
                  value={translation.en}
                  disabled={selectedLanguage !== "en"}
                  onChange={(e) => handleTranslationChange(index, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {languages.find((l) => l.code === selectedLanguage)?.name}
                </label>
                <Input
                  value={translation[selectedLanguage] || ""}
                  disabled={selectedLanguage === "en"}
                  onChange={(e) => handleTranslationChange(index, e.target.value)}
                  placeholder={selectedLanguage === "en" ? "" : translation.en}
                />
              </div>
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="mt-6">
            {saving ? "Saving..." : "Save Translations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getSampleTranslations(section: string): Translation[] {
  if (section === "interface") {
    return [
      { key: "common.save", en: "Save", es: "Guardar", fr: "Enregistrer" },
      { key: "common.cancel", en: "Cancel", es: "Cancelar", fr: "Annuler" },
      { key: "common.delete", en: "Delete", es: "Eliminar", fr: "Supprimer" },
      { key: "common.edit", en: "Edit", es: "Editar", fr: "Éditer" },
      { key: "common.add", en: "Add", es: "Añadir", fr: "Ajouter" },
      { key: "nav.dashboard", en: "Dashboard", es: "Panel", fr: "Tableau de bord" },
      { key: "nav.products", en: "Products", es: "Productos", fr: "Produits" },
      { key: "nav.orders", en: "Orders", es: "Pedidos", fr: "Commandes" },
      { key: "nav.customers", en: "Customers", es: "Clientes", fr: "Clients" },
      { key: "nav.settings", en: "Settings", es: "Ajustes", fr: "Paramètres" },
    ]
  } else if (section === "products") {
    return [
      { key: "product.size", en: "Size", es: "Talla", fr: "Taille" },
      { key: "product.color", en: "Color", es: "Color", fr: "Couleur" },
      { key: "product.fabric", en: "Fabric", es: "Tela", fr: "Tissu" },
      { key: "product.style", en: "Style", es: "Estilo", fr: "Style" },
      { key: "product.price", en: "Price", es: "Precio", fr: "Prix" },
      { key: "product.addToCart", en: "Add to Cart", es: "Añadir al Carrito", fr: "Ajouter au Panier" },
      { key: "product.outOfStock", en: "Out of Stock", es: "Agotado", fr: "Rupture de Stock" },
      { key: "product.customization", en: "Customization", es: "Personalización", fr: "Personnalisation" },
      { key: "product.measurements", en: "Measurements", es: "Medidas", fr: "Mesures" },
      { key: "product.details", en: "Details", es: "Detalles", fr: "Détails" },
    ]
  } else {
    return [
      {
        key: "email.orderConfirmation",
        en: "Order Confirmation",
        es: "Confirmación de Pedido",
        fr: "Confirmation de Commande",
      },
      {
        key: "email.orderShipped",
        en: "Your Order Has Shipped",
        es: "Tu Pedido Ha Sido Enviado",
        fr: "Votre Commande a été Expédiée",
      },
      {
        key: "email.orderDelivered",
        en: "Your Order Has Been Delivered",
        es: "Tu Pedido Ha Sido Entregado",
        fr: "Votre Commande a été Livrée",
      },
      {
        key: "email.welcome",
        en: "Welcome to Our Store",
        es: "Bienvenido a Nuestra Tienda",
        fr: "Bienvenue dans Notre Boutique",
      },
      {
        key: "email.passwordReset",
        en: "Password Reset",
        es: "Restablecimiento de Contraseña",
        fr: "Réinitialisation du Mot de Passe",
      },
      {
        key: "email.thankYou",
        en: "Thank You for Your Purchase",
        es: "Gracias por Tu Compra",
        fr: "Merci pour Votre Achat",
      },
      {
        key: "email.abandoned",
        en: "You Left Items in Your Cart",
        es: "Dejaste Artículos en Tu Carrito",
        fr: "Vous Avez Laissé des Articles dans Votre Panier",
      },
      {
        key: "email.discount",
        en: "Special Discount Just for You",
        es: "Descuento Especial Solo para Ti",
        fr: "Remise Spéciale Juste pour Vous",
      },
      { key: "email.support", en: "Customer Support", es: "Atención al Cliente", fr: "Service Client" },
      {
        key: "email.feedback",
        en: "We'd Love Your Feedback",
        es: "Nos Encantaría Tu Opinión",
        fr: "Nous Aimerions Votre Avis",
      },
    ]
  }
}
