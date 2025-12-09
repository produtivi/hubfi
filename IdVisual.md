# Hubfi

## Paleta de Cores

### Light Mode

| Cor     | Hex       | Uso                          |
|---------|-----------|------------------------------|
| Branco  | `#FFFFFF` | Fundos principais            |
| Cinza   | `#B7B7B7` | Bordas, divisores, disabled  |
| Chumbo  | `#5E5E5E` | Texto secundário             |
| Preto   | `#181818` | Texto principal, estrutura   |

### Dark Mode

| Cor           | Hex       | Uso                          |
|---------------|-----------|------------------------------|
| Preto         | `#0A0A0A` | Fundos principais            |
| Carvão        | `#1A1A1A` | Fundos elevados (cards)      |
| Chumbo escuro | `#2A2A2A` | Bordas, divisores            |
| Cinza         | `#8A8A8A` | Texto secundário             |
| Cinza claro   | `#E5E5E5` | Texto principal              |

**Conceito:** A paleta monocromática traduz clareza, disciplina e compromisso com a vida real. No dark mode, invertemos a hierarquia mantendo o mesmo peso visual e contraste.

---

## Tipografia

### STIX Two (Serifada)
- **Função:** Títulos, números grandes, destaques
- **Pesos:** Regular, Medium
- **Line-height:** 100%
- **Letter-spacing:** 0%

### Acumin Pro (Sans-serif)
- **Função:** Subtítulos, corpo de texto, labels
- **Pesos:** Light, Regular, Medium
- **Line-height:** 100%
- **Letter-spacing:** 0%

---

## Estilo de UI

**Minimalismo estruturado** — interfaces limpas, com muito espaço negativo, hierarquia clara e zero elementos decorativos desnecessários.

### Princípios

**Tipografia como protagonista**  
STIX Two para títulos e números grandes (seriedade e maturidade). Acumin Pro para corpo e labels. Evitar tamanhos pequenos — a marca fala com adultos que valorizam legibilidade.

**Grid rígido e modular**  
A UI deve seguir um grid consistente. Cards e seções devem parecer blocos bem definidos, nunca flutuando sem propósito.

**Cores funcionais**  
Preto para texto primário, chumbo para secundários, cinza para bordas e divisores. Branco como fundo. Cores adicionais apenas para estados críticos (erro, sucesso).

---

## Visualização de Dados

**Gráficos de linha**  
Linhas verticais finas para representar dias/semanas. Variações de espessura e tons de cinza — sem cores chamativas.

**KPIs e métricas**  
Números grandes em STIX Two, com bastante respiro. O número fala por si.

**Cards em vez de tabelas**  
Layouts modulares com cards. Bordas sutis, cantos levemente arredondados (4-8px), espaçamento generoso.

**Barras de progresso**  
Finas, monocromáticas, representando a jornada constante.

---

## Implementação — shadcn/ui

### Variáveis CSS (globals.css)

```css
@layer base {
  :root {
    /* Light Mode */
    --background: 0 0% 100%;           /* #FFFFFF */
    --foreground: 0 0% 9%;             /* #181818 */
    
    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 0 0% 9%;        /* #181818 */
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;
    
    --primary: 0 0% 9%;                /* #181818 */
    --primary-foreground: 0 0% 100%;   /* #FFFFFF */
    
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 9%;
    
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 37%;      /* #5E5E5E */
    
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    
    --border: 0 0% 72%;                /* #B7B7B7 */
    --input: 0 0% 72%;
    --ring: 0 0% 9%;
    
    --radius: 0.375rem;                /* 6px */
  }

  .dark {
    /* Dark Mode */
    --background: 0 0% 4%;             /* #0A0A0A */
    --foreground: 0 0% 90%;            /* #E5E5E5 */
    
    --card: 0 0% 10%;                  /* #1A1A1A */
    --card-foreground: 0 0% 90%;       /* #E5E5E5 */
    
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 90%;
    
    --primary: 0 0% 90%;               /* #E5E5E5 */
    --primary-foreground: 0 0% 4%;     /* #0A0A0A */
    
    --secondary: 0 0% 14%;
    --secondary-foreground: 0 0% 90%;
    
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 54%;      /* #8A8A8A */
    
    --accent: 0 0% 14%;
    --accent-foreground: 0 0% 90%;
    
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 100%;
    
    --success: 142 69% 45%;
    --success-foreground: 0 0% 100%;
    
    --border: 0 0% 16%;                /* #2A2A2A */
    --input: 0 0% 16%;
    --ring: 0 0% 90%;
  }
}
```

### Tailwind Config (tailwind.config.js)

```js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  // ... resto da config shadcn
  theme: {
    extend: {
      colors: {
        brand: {
          // Light
          white: "#FFFFFF",
          gray: "#B7B7B7",
          charcoal: "#5E5E5E",
          black: "#181818",
          // Dark
          dark: {
            bg: "#0A0A0A",
            card: "#1A1A1A",
            border: "#2A2A2A",
            muted: "#8A8A8A",
            text: "#E5E5E5",
          }
        }
      },
      fontFamily: {
        serif: ["STIX Two Text", ...fontFamily.serif],
        sans: ["Acumin Pro", ...fontFamily.sans],
      },
      fontSize: {
        "display": ["3.5rem", { lineHeight: "1", fontWeight: "500" }],
        "headline": ["2.25rem", { lineHeight: "1", fontWeight: "500" }],
        "title": ["1.5rem", { lineHeight: "1.1", fontWeight: "500" }],
        "body": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "label": ["0.875rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
    },
  },
}
```

### Classes utilitárias

```css
@layer components {
  /* Títulos com STIX Two */
  .text-display {
    @apply font-serif text-display text-foreground;
  }
  
  .text-headline {
    @apply font-serif text-headline text-foreground;
  }
  
  .text-title {
    @apply font-serif text-title text-foreground;
  }
  
  /* Corpo com Acumin Pro */
  .text-body {
    @apply font-sans text-body text-foreground;
  }
  
  .text-body-muted {
    @apply font-sans text-body text-muted-foreground;
  }
  
  .text-label {
    @apply font-sans text-label text-muted-foreground;
  }
}
```

---

## Componentes Customizados

### Card

```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border border-border bg-card p-6",
      "shadow-none hover:shadow-sm transition-shadow",
      className
    )}
    {...props}
  />
))
```

### Button

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans text-label transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border border-border bg-transparent hover:bg-accent",
        ghost: "hover:bg-accent",
        link: "underline-offset-4 hover:underline text-foreground",
      },
      size: {
        default: "h-10 px-6 rounded-md",
        sm: "h-8 px-4 rounded-md text-sm",
        lg: "h-12 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Input

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2",
          "font-sans text-body text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Badge

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 font-sans text-xs transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-muted-foreground",
        success: "bg-success/20 text-success dark:bg-success/30",
        destructive: "bg-destructive/20 text-destructive dark:bg-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### Progress

```tsx
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
```

---

## Theme Toggle

```tsx
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
```

---

## Padrões de Layout

### Card de Métrica/KPI

```tsx
<Card>
  <p className="text-label mb-1">Receita Mensal</p>
  <p className="text-display">R$ 47.500</p>
  <p className="text-label mt-2">+12% vs. mês anterior</p>
</Card>
```

### Card de Item/Projeto

```tsx
<Card className="flex items-start justify-between">
  <div>
    <h3 className="text-title">Nome do Projeto</h3>
    <p className="text-body-muted mt-1">Descrição breve do projeto</p>
  </div>
  <Badge variant="secondary">Em andamento</Badge>
</Card>
```

### Espaçamento entre Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards aqui */}
</div>
```

---

## Referência Rápida de Cores

| Variável              | Light       | Dark        |
|-----------------------|-------------|-------------|
| `--background`        | `#FFFFFF`   | `#0A0A0A`   |
| `--foreground`        | `#181818`   | `#E5E5E5`   |
| `--card`              | `#FFFFFF`   | `#1A1A1A`   |
| `--border`            | `#B7B7B7`   | `#2A2A2A`   |
| `--muted-foreground`  | `#5E5E5E`   | `#8A8A8A`   |
| `--primary`           | `#181818`   | `#E5E5E5`   |