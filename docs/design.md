# 🎨 Design System

## 📋 Visão Geral

O Design System da Artesani estabelece uma linguagem visual consistente e moderna para toda a aplicação, baseado em princípios de usabilidade, acessibilidade e identidade da marca farmacêutica.

---

## 🎯 Princípios de Design

### **Consistência Visual**
> **⚠️ REGRA FUNDAMENTAL:**
> 
> **NUNCA altere o design principal e padrão de cores da página home!**
> - Mantenha todos os elementos bem centralizados e alinhados
> - Preserve a identidade visual da marca Artesani
> - Qualquer alteração deve seguir os padrões de posicionamento estabelecidos
> - Faça apenas alterações de posicionamento quando necessário

### **Princípios Fundamentais**
1. **Clareza**: Interface limpa e intuitiva
2. **Confiança**: Design profissional e seguro
3. **Acessibilidade**: Usável por todos os usuários
4. **Responsividade**: Funciona em todos os dispositivos
5. **Performance**: Carregamento rápido e fluido

---

## 🎨 Paleta de Cores

### **Cores Primárias**
```css
/* Azul Institucional da Artesani */
--primary: 214 100% 50%;           /* #0080FF */
--primary-foreground: 0 0% 100%;   /* #FFFFFF */

/* Variações do Azul */
--primary-50: 214 100% 97%;        /* #F0F8FF */
--primary-100: 214 100% 94%;       /* #E1F1FF */
--primary-200: 214 100% 87%;       /* #C3E3FF */
--primary-300: 214 100% 74%;       /* #94D1FF */
--primary-400: 214 100% 61%;       /* #66BFFF */
--primary-500: 214 100% 50%;       /* #0080FF */
--primary-600: 214 100% 45%;       /* #0073E6 */
--primary-700: 214 100% 35%;       /* #0059B3 */
--primary-800: 214 100% 25%;       /* #003F80 */
--primary-900: 214 100% 15%;       /* #00264D */
```

### **Cores Secundárias**
```css
/* Laranja/Dourado - Cor de Destaque */
--secondary: 38 100% 50%;          /* #FF8C00 */
--secondary-foreground: 0 0% 100%; /* #FFFFFF */

/* Variações do Laranja */
--secondary-50: 38 100% 97%;       /* #FFF8F0 */
--secondary-100: 38 100% 94%;      /* #FFE1C7 */
--secondary-200: 38 100% 87%;      /* #FFC78F */
--secondary-300: 38 100% 74%;      /* #FFAD57 */
--secondary-400: 38 100% 61%;      /* #FF931F */
--secondary-500: 38 100% 50%;      /* #FF8C00 */
--secondary-600: 38 100% 45%;      /* #E67E00 */
--secondary-700: 38 100% 35%;      /* #B36200 */
--secondary-800: 38 100% 25%;      /* #804600 */
--secondary-900: 38 100% 15%;      /* #4D2A00 */
```

### **Cores Neutras**
```css
/* Tons de Cinza */
--background: 0 0% 100%;           /* #FFFFFF */
--foreground: 0 0% 3.9%;           /* #0A0A0A */

--card: 0 0% 100%;                 /* #FFFFFF */
--card-foreground: 0 0% 3.9%;      /* #0A0A0A */

--popover: 0 0% 100%;              /* #FFFFFF */
--popover-foreground: 0 0% 3.9%;   /* #0A0A0A */

--muted: 0 0% 96.1%;               /* #F5F5F5 */
--muted-foreground: 0 0% 45.1%;    /* #737373 */

--accent: 0 0% 96.1%;              /* #F5F5F5 */
--accent-foreground: 0 0% 9%;      /* #171717 */

--border: 0 0% 89.8%;              /* #E5E5E5 */
--input: 0 0% 89.8%;               /* #E5E5E5 */
--ring: 214 100% 50%;              /* #0080FF */
```

### **Cores de Estado**
```css
/* Sucesso */
--success: 142 76% 36%;            /* #16A34A */
--success-foreground: 0 0% 100%;   /* #FFFFFF */

/* Aviso */
--warning: 38 92% 50%;             /* #F59E0B */
--warning-foreground: 0 0% 100%;   /* #FFFFFF */

/* Erro */
--destructive: 0 84% 60%;          /* #EF4444 */
--destructive-foreground: 0 0% 100%; /* #FFFFFF */

/* Informação */
--info: 199 89% 48%;               /* #0EA5E9 */
--info-foreground: 0 0% 100%;      /* #FFFFFF */
```

---

## 📝 Tipografia

### **Família de Fontes**
```css
/* Fonte Principal */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Fonte Mono (Código) */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, monospace;
```

### **Escalas Tipográficas**
```css
/* Títulos */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* 18px */

/* Texto Base */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* 12px */

/* Pesos */
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }
```

### **Hierarquia Tipográfica**
```typescript
// Uso recomendado
const TypographyScale = {
  h1: "text-4xl font-bold",           // Títulos principais
  h2: "text-3xl font-semibold",       // Títulos de seção
  h3: "text-2xl font-semibold",       // Subtítulos
  h4: "text-xl font-medium",          // Títulos menores
  h5: "text-lg font-medium",          // Labels importantes
  h6: "text-base font-medium",        // Labels
  body: "text-base font-normal",      // Texto corrido
  caption: "text-sm text-muted-foreground", // Legendas
  small: "text-xs text-muted-foreground",   // Texto pequeno
};
```

---

## 🧩 Componentes Base

### **Botões**
```typescript
// Variantes de botão
const ButtonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

// Tamanhos
const ButtonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

// Exemplo de uso
<Button variant="default" size="lg">
  Adicionar ao Carrinho
</Button>
```

### **Cards**
```typescript
// Estrutura de card
const Card = ({ children, className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Exemplo de uso
<Card className="p-6">
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do conteúdo</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo do card */}
  </CardContent>
  <CardFooter>
    {/* Ações do card */}
  </CardFooter>
</Card>
```

### **Inputs**
```typescript
// Variantes de input
const Input = ({ type = "text", className, ...props }) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

// Estados
const InputStates = {
  default: "border-input",
  error: "border-destructive focus-visible:ring-destructive",
  success: "border-success focus-visible:ring-success",
  disabled: "opacity-50 cursor-not-allowed",
};
```

---

## 📱 Responsividade

### **Breakpoints**
```css
/* Tailwind Breakpoints */
sm: 640px;    /* Tablet pequeno */
md: 768px;    /* Tablet */
lg: 1024px;   /* Desktop pequeno */
xl: 1280px;   /* Desktop */
2xl: 1536px;  /* Desktop grande */
```

### **Grid System**
```typescript
// Sistema de grid responsivo
const GridSystem = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  row: "flex flex-wrap -mx-4",
  col: "px-4",
  
  // Colunas responsivas
  "col-12": "w-full",
  "col-6": "w-full md:w-1/2",
  "col-4": "w-full md:w-1/3",
  "col-3": "w-full md:w-1/4",
};

// Exemplo de uso
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
</div>
```

---

## 🎯 Padrões de Layout

### **Header**
```typescript
// Estrutura do header
const Header = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <div className="mr-4 hidden md:flex">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <nav className="flex items-center">
          {/* Navegação */}
        </nav>
      </div>
    </div>
  </header>
);
```

### **Sidebar**
```typescript
// Sidebar responsiva
const Sidebar = ({ children, open, onClose }) => (
  <>
    {/* Overlay mobile */}
    {open && (
      <div 
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
      />
    )}
    
    {/* Sidebar */}
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      {children}
    </div>
  </>
);
```

### **Footer**
```typescript
// Footer consistente
const Footer = () => (
  <footer className="border-t bg-background">
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Sua farmácia de manipulação de confiança
          </p>
        </div>
        {/* Outras colunas */}
      </div>
    </div>
  </footer>
);
```

---

## 🎨 Componentes Específicos

### **Product Card**
```typescript
const ProductCard = ({ product }) => (
  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
    <div className="aspect-square overflow-hidden">
      <img
        src={product.images[0]}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {product.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">
          R$ {product.price.toFixed(2)}
        </span>
        <Button size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Comprar
        </Button>
      </div>
    </CardContent>
  </Card>
);
```

### **Loading States**
```typescript
// Skeleton loading
const ProductCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square" />
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Spinner loading
const LoadingSpinner = ({ size = "default" }) => (
  <div className="flex items-center justify-center">
    <Loader2 className={cn(
      "animate-spin",
      size === "sm" && "h-4 w-4",
      size === "default" && "h-6 w-6",
      size === "lg" && "h-8 w-8"
    )} />
  </div>
);
```

---

## 🚨 Estados de Feedback

### **Toasts/Notifications**
```typescript
// Variantes de toast
const ToastVariants = {
  default: "bg-background text-foreground",
  destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

// Exemplo de uso
toast({
  title: "Produto adicionado!",
  description: "O produto foi adicionado ao seu carrinho.",
  variant: "success",
});
```

### **Alerts**
```typescript
const Alert = ({ variant = "default", children }) => (
  <div className={cn(
    "relative w-full rounded-lg border p-4",
    variant === "default" && "bg-background text-foreground",
    variant === "destructive" && "border-destructive/50 text-destructive dark:border-destructive",
    variant === "success" && "border-success/50 text-success",
    variant === "warning" && "border-warning/50 text-warning"
  )}>
    {children}
  </div>
);
```

---

## 🎭 Animações e Transições

### **Transições Padrão**
```css
/* Transições suaves */
.transition-base {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}
```

### **Hover Effects**
```css
/* Efeitos de hover */
.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### **Loading Animations**
```css
/* Animações de loading */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
```

---

## 📐 Espaçamento e Dimensões

### **Sistema de Espaçamento**
```css
/* Escala de espaçamento (baseada em rem) */
.space-0 { margin: 0; }
.space-1 { margin: 0.25rem; }    /* 4px */
.space-2 { margin: 0.5rem; }     /* 8px */
.space-3 { margin: 0.75rem; }    /* 12px */
.space-4 { margin: 1rem; }       /* 16px */
.space-5 { margin: 1.25rem; }    /* 20px */
.space-6 { margin: 1.5rem; }     /* 24px */
.space-8 { margin: 2rem; }       /* 32px */
.space-10 { margin: 2.5rem; }    /* 40px */
.space-12 { margin: 3rem; }      /* 48px */
.space-16 { margin: 4rem; }      /* 64px */
.space-20 { margin: 5rem; }      /* 80px */
.space-24 { margin: 6rem; }      /* 96px */
```

### **Bordas e Raios**
```css
/* Raios de borda */
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: 0.125rem; }   /* 2px */
.rounded { border-radius: 0.25rem; }       /* 4px */
.rounded-md { border-radius: 0.375rem; }   /* 6px */
.rounded-lg { border-radius: 0.5rem; }     /* 8px */
.rounded-xl { border-radius: 0.75rem; }    /* 12px */
.rounded-2xl { border-radius: 1rem; }      /* 16px */
.rounded-full { border-radius: 9999px; }
```

---

## 🎯 Boas Práticas

### **Acessibilidade**
```typescript
// Sempre incluir labels e aria-labels
<Button aria-label="Adicionar produto ao carrinho">
  <ShoppingCart className="h-4 w-4" />
</Button>

// Contraste adequado
const checkContrast = (foreground: string, background: string) => {
  // Ratio mínimo de 4.5:1 para texto normal
  // Ratio mínimo de 3:1 para texto grande
};

// Focus visível
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### **Performance**
```typescript
// Otimizar imagens
const OptimizedImage = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    {...props}
  />
);

// Lazy loading de componentes
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

### **Consistência**
```typescript
// Usar design tokens
const theme = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    // ...
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
};
```

---

## 🔧 Ferramentas e Utilities

### **Class Utilities**
```typescript
// Utility para combinar classes
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uso
<div className={cn(
  "base-classes",
  variant === "primary" && "primary-classes",
  disabled && "disabled-classes",
  className
)}>
```

### **Theme Provider**
```typescript
// Provedor de tema
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

---

## 📋 Checklist de Design

### **Antes de Implementar**
- [ ] Verificar se segue o padrão de cores estabelecido
- [ ] Confirmar que elementos estão centralizados e alinhados
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Verificar estados de hover, focus e active
- [ ] Testar com screen readers
- [ ] Otimizar para performance

### **Após Implementar**
- [ ] Testar em diferentes navegadores
- [ ] Validar em dispositivos móveis reais
- [ ] Verificar carregamento de fontes
- [ ] Testar estados de loading
- [ ] Validar animações e transições
- [ ] Revisar acessibilidade
- [ ] Documentar componente criado

---

**Última atualização**: Janeiro 2025 