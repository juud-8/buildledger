"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  // This would normally check for an existing session on load
  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = async () => {
      try {
        // This would normally call your auth service
        // For demo, we'll just set loading to false
        setIsLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // This would normally call your auth service
      // For demo, we'll just set a mock user
      setUser({
        id: "1",
        name: "Jeff Doht",
        email: email,
      })
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // This would normally call your auth service
      // For demo, we'll just set a mock user
      setUser({
        id: "1",
        name: name,
        email: email,
      })
    } catch (error) {
      console.error("Sign up failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // This would normally call your auth service
      setUser(null)
    } catch (error) {
      console.error("Sign out failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
