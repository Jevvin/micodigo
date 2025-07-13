/**
 * customer.ts
 * 
 * Tipos para datos de clientes y direcciones.
 */

export interface Customer {
  id: number
  auth_id?: string
  name: string
  phone: string
  email?: string
  created_at: string
}

export interface CustomerAddress {
  id: number
  customer_id: number
  address_line: string
  city?: string
  state?: string
  zip_code?: string
  instructions?: string
  latitude?: number
  longitude?: number
  created_at: string
}
