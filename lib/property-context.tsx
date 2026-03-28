"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Property } from "@/lib/data"
import { useAdminAuth } from "@/lib/admin-auth"

interface PropertyContextType {
  properties: Property[]
  loading: boolean
  error: string | null
  addProperty: (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  getProperty: (id: string) => Property | undefined
  refreshProperties: () => Promise<void>
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAdminAuth()

  const fetchProperties = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/properties")
      if (!res.ok) throw new Error("Failed to fetch properties")
      const data = await res.json()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const authHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }, [token])

  const addProperty = useCallback(
    async (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(propertyData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create property")
      }
      await fetchProperties()
    },
    [fetchProperties, authHeaders]
  )

  const updateProperty = useCallback(
    async (id: string, updates: Partial<Property>) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update property")
      }
      await fetchProperties()
    },
    [fetchProperties, authHeaders]
  )

  const deleteProperty = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete property")
      }
      await fetchProperties()
    },
    [fetchProperties, authHeaders]
  )

  const getProperty = useCallback(
    (id: string) => {
      return properties.find((p) => p.id === id)
    },
    [properties]
  )

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        error,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty,
        refreshProperties: fetchProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  )
}

export function useProperties() {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error("useProperties must be used within a PropertyProvider")
  }
  return context
}
