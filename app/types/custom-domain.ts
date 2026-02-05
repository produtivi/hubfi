// Tipos para gerenciamento de domínios customizados

export type DomainStatus = 'pending' | 'active' | 'error' | 'validating'
export type SSLStatus = 'pending' | 'active' | 'error'

export interface CustomDomain {
  id: string
  hostname: string
  userId: number
  status: DomainStatus
  sslStatus: SSLStatus
  cnameTarget: string
  createdAt: string
  updatedAt: string
  verifiedAt?: string
  errorMessage?: string
}

export interface CloudflareCustomHostname {
  id: string
  hostname: string
  status: string
  ssl: {
    status: string
    method: string
    type: string
    validation_errors?: Array<{
      message: string
    }>
  }
  verification_errors?: string[]
  created_at: string
  updated_at?: string
}

export interface AddDomainRequest {
  hostname: string
  userId: number
}

export interface AddDomainResponse {
  success: boolean
  domain?: CustomDomain
  error?: string
}

export interface ValidateDNSResponse {
  success: boolean
  configured: boolean
  currentTarget?: string
  expectedTarget: string
  message: string
}
