"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getTranslationsForLanguage } from "@/lib/i18n/translation-service"

interface TranslationContextType {
  language: string
  setLanguage: (language: string) => void
  t: (key: string, defaultValue?: string) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
  defaultLanguage?: string
}

export function TranslationProvider({ children, defaultLanguage = "en" }: TranslationProviderProps) {
  const [language, setLanguage] = useState(defaultLanguage)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        // Try to load from localStorage first for faster initial load
        const cachedTranslations = localStorage.getItem(`translations_€{language}`)

        if (cachedTranslations) {
          setTranslations(JSON.parse(cachedTranslations))
          setIsLoading(false)
        }

        // Always fetch fresh translations from the server
        const freshTranslations = await getTranslationsForLanguage(language)

        // Cache the translations in localStorage
        localStorage.setItem(`translations_€{language}`, JSON.stringify(freshTranslations))

        setTranslations(freshTranslations)
      } catch (error) {
        console.error("Error loading translations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  // Translation function
  const t = (key: string, defaultValue?: string): string => {
    if (isLoading) return defaultValue || key
    return translations[key] || defaultValue || key
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
