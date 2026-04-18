import { createContext, useContext, useState } from 'react'
import { translations, detectLanguage, setLanguage } from './i18n'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage())

  const t = (key) => translations[lang][key] || key

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    setLanguage(newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}