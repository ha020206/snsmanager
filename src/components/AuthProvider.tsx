'use client'

import { createContext, useContext, useState } from 'react'

export type LocalUser = { uid: string; email: string }

type AuthContextType = {
  user: LocalUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading] = useState(false)

  const signIn = async (email: string, _password: string) => {
    setUser({ uid: 'local', email })
  }

  const signUp = async (email: string, _password: string) => {
    setUser({ uid: 'local', email })
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
