import { useEffect, useState } from "react"
import type { Theme, ThemeProviderProps } from "@/types/theme"
import { ThemeProviderContext } from "./ThemeContext"

function safeLocalStorageGet(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (safeLocalStorageGet(storageKey) as Theme) || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    const applySystemTheme = (m: MediaQueryList | MediaQueryListEvent) => {
      const isDark = ('matches' in m ? m.matches : false)
      root.classList.remove("light", "dark")
      root.classList.add(isDark ? 'dark' : 'light')
    }

    // If theme is 'system' we should reflect current system theme and listen for changes
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      applySystemTheme(mq)
      // add listener for changes
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', applySystemTheme)
      } else if (typeof mq.addListener === 'function') {
        // Safari older API
        mq.addListener(applySystemTheme)
      }
      return () => {
        if (typeof mq.removeEventListener === 'function') {
          mq.removeEventListener('change', applySystemTheme)
        } else if (typeof mq.removeListener === 'function') {
          mq.removeListener(applySystemTheme)
        }
      }
    }

    // Non-system theme: just set it
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    return
  }, [theme])

  const value = {
    theme,
    setTheme: (t: Theme) => {
      safeLocalStorageSet(storageKey, t)
      setTheme(t)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
