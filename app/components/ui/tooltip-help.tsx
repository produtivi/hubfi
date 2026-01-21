'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'
import Image from 'next/image'

interface TooltipHelpProps {
  text: string
  imageSrc?: string
  imageAlt?: string
}

export function TooltipHelp({ text, imageSrc, imageAlt = 'Exemplo' }: TooltipHelpProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isVisible])

  const closeTooltip = () => {
    setIsVisible(false)
  }

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsVisible(!isVisible)
        }}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Ajuda"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div className="absolute z-50 top-full left-0 mt-2">
          {/* Seta */}
          <div className="absolute bottom-full left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-border" />

          <div className="bg-card border border-border rounded-lg shadow-xl p-3 w-72 relative">
            {/* Botão fechar */}
            <span
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                closeTooltip()
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-0.5 hover:bg-accent rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>

            {/* Imagem de exemplo */}
            {imageSrc && (
              <div className="mb-2 mt-5 rounded-md overflow-hidden border border-border">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={256}
                  height={40}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Texto explicativo */}
            <p className="text-sm text-foreground leading-relaxed pr-5">
              {text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
