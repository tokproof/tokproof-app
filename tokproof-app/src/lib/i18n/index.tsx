'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import pt from '@/locales/pt.json'

export type Lang = 'en' | 'es' | 'fr' | 'pt'

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'pt', label: '🇵🇹 Português' },
]

const STORAGE_KEY = 'tokproof-lang'
const VALID_LANGS: Lang[] = ['en', 'es', 'fr', 'pt']

const DICTS: Record<Lang, Record<string, string>> = {
  en: en as Record<string, string>,
  es: es as Record<string, string>,
  fr: fr as Record<string, string>,
  pt: pt as Record<string, string>,
}

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
      if (saved && VALID_LANGS.includes(saved)) {
        setLangState(saved)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }

  function t(key: string, vars?: Record<string, string>): string {
    const dict = DICTS[lang]
    const fallback = DICTS['en']
    let str = (dict[key] ?? fallback[key] ?? key) as string
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v)
      }
    }
    return str
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
