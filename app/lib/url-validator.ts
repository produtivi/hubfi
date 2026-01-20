/**
 * Validação e sanitização de URLs para prevenir ataques
 * Proteção contra: Command Injection, SSRF, XSS, RCE
 */

// Protocolos permitidos
const ALLOWED_PROTOCOLS = ['http:', 'https:']

// Padrões de URLs maliciosas
const MALICIOUS_PATTERNS = [
  // Command injection
  /\$\(/gi,
  /`/g,
  /\|\|/g,
  /&&/g,
  /;/g,

  // SSRF - IPs internos e localhost
  /localhost/gi,
  /127\.0\.0\./g,
  /192\.168\./g,
  /10\.\d+\.\d+\.\d+/g,
  /172\.(1[6-9]|2[0-9]|3[01])\./g,
  /::1/g,
  /0\.0\.0\.0/g,

  // URLs de arquivo local
  /file:\/\//gi,
  /jar:\/\//gi,
  /ftp:\/\//gi,

  // JavaScript e data URLs
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,

  // URL encoding malicioso
  /%00/gi, // null byte
  /%0d/gi, // carriage return
  /%0a/gi, // line feed
]

// Domínios permitidos para screenshots (whitelist)
const ALLOWED_DOMAINS_PATTERNS = [
  // Hotmart e similares
  /\.hotmart\.com$/i,
  /\.braip\.com$/i,
  /\.monetizze\.com\.br$/i,
  /\.eduzz\.com$/i,
  /\.perfectpay\.com\.br$/i,
  /\.kiwify\.com\.br$/i,
  /\.ticto\.com\.br$/i,
  /\.appmax\.com\.br$/i,
  /\.greenn\.com\.br$/i,
  /\.lastlink\.com\.br$/i,
  /\.pagar\.me$/i,

  // Domínios personalizados confiáveis (adicionar conforme necessário)
  // Exemplo: /\.meudominio\.com\.br$/i,
]

export interface URLValidationResult {
  isValid: boolean
  url?: URL
  error?: string
  sanitized?: string
}

/**
 * Valida se uma URL é segura para ser acessada
 */
export function validateURL(urlString: string): URLValidationResult {
  try {
    // Trim e validação básica
    const trimmed = urlString.trim()

    if (!trimmed) {
      return {
        isValid: false,
        error: 'URL vazia'
      }
    }

    // Verificar tamanho máximo (prevenir DoS)
    if (trimmed.length > 2000) {
      return {
        isValid: false,
        error: 'URL muito longa'
      }
    }

    // Tentar fazer parse da URL
    let url: URL
    try {
      url = new URL(trimmed)
    } catch (e) {
      return {
        isValid: false,
        error: 'URL inválida ou malformada'
      }
    }

    // Verificar protocolo
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return {
        isValid: false,
        error: `Protocolo não permitido: ${url.protocol}`
      }
    }

    // Verificar padrões maliciosos na URL completa
    const fullUrl = url.toString()
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(fullUrl)) {
        return {
          isValid: false,
          error: 'URL contém padrões suspeitos ou maliciosos'
        }
      }
    }

    // Verificar hostname
    const hostname = url.hostname.toLowerCase()

    // Bloquear IPs diretamente (apenas domínios são permitidos)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return {
        isValid: false,
        error: 'Acesso direto por IP não é permitido'
      }
    }

    // Verificar se o domínio está na whitelist
    const isDomainAllowed = ALLOWED_DOMAINS_PATTERNS.some(pattern =>
      pattern.test(hostname)
    )

    if (!isDomainAllowed) {
      return {
        isValid: false,
        error: `Domínio não autorizado: ${hostname}. Apenas domínios de plataformas conhecidas são permitidos.`
      }
    }

    // URL válida e segura
    return {
      isValid: true,
      url,
      sanitized: url.toString()
    }

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro ao validar URL'
    }
  }
}

/**
 * Valida se um hostname/domínio é seguro
 */
export function isHostnameSafe(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim()

  // Verificar padrões maliciosos
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(normalized)) {
      return false
    }
  }

  // Verificar se está na whitelist
  return ALLOWED_DOMAINS_PATTERNS.some(pattern => pattern.test(normalized))
}

/**
 * Adiciona um domínio customizado à whitelist (use com cuidado!)
 */
export function addTrustedDomain(domain: string): void {
  // Escape regex special characters
  const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ALLOWED_DOMAINS_PATTERNS.push(new RegExp(`\\.${escaped}$`, 'i'))
}
