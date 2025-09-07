'use client'
import { createContext, useState } from 'react'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState('dark')
  return (
    <ThemeContext.Provider value={theme}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}