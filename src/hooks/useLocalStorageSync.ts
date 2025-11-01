import { useEffect } from 'react'

export const useLocalStorageSync = (key: string, value: string | number | boolean): void => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, String(value))
    } catch (error) {
      console.error(`Failed to sync ${key} to localStorage`, error)
    }
  }, [key, value])
}
