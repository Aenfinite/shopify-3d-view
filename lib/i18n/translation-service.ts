// Firebase removed — translations are managed as static files.
// Define supported languages
export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
]

// Define translation sections
export const translationSections = [
  { id: "interface", name: "Interface" },
  { id: "products", name: "Products" },
  { id: "emails", name: "Emails" },
  { id: "measurements", name: "Measurements" },
]

// Translation interface
export interface Translation {
  key: string
  section: string
  en: string
  [key: string]: string
}

// Get all translations
export async function getAllTranslations(): Promise<Translation[]> {
  return []
}

export async function getTranslationsBySection(section: string): Promise<Translation[]> {
  return []
}

export async function saveTranslation(translation: Translation): Promise<void> {}

// Get translations for a specific language
export async function getTranslationsForLanguage(languageCode: string): Promise<Record<string, string>> {
  try {
    const allTranslations = await getAllTranslations()

    // Create a map of translation keys to their translated values
    const translationMap: Record<string, string> = {}

    allTranslations.forEach((translation) => {
      // Use the English version as fallback if the requested language translation doesn't exist
      translationMap[translation.key] = translation[languageCode] || translation.en
    })

    return translationMap
  } catch (error) {
    console.error(`Error fetching translations for language €{languageCode}:`, error)
    return {}
  }
}
