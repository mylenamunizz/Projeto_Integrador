# Guia de Integração dos Foguetes - Ranking de Produtividade

## Sistema de Animações Implementado

O sistema de animações dos foguetes foi completamente implementado com:
- **CSS @keyframes** para entrada, flutuação e fade-in
- **JavaScript/React** para controle temporal preciso
- **Overlay fixo** com z-index elevado para "quebra de quarta parede"

## Como Substituir as Imagens dos Foguetes

### Localização no Código
O caminho para substituição está em: `src/pages/Ranking.tsx`

Procure pela linha:
```jsx
src="caminho/para/seu-foguete.png"
```

### Passos para Integração:

1. **Prepare suas imagens de foguete:**
   - Formato recomendado: PNG ou SVG
   - Tamanho base: 96x96px (w-24 h-24) ou maior
   - Tema: Compatível com fundo escuro (dark theme)
   - Quantidade: Uma imagem ou 3 variações (opcional)

2. **Copie os arquivos para `/frontend/src/assets/`:**
   - `seu-foguete-1.png` - para o foguete #1 (1º lugar - centro)
   - `seu-foguete-2.png` - para o foguete #2 (2º lugar - esquerda)
   - `seu-foguete-3.png` - para o foguete #3 (3º lugar - direita)

3. **Atualize o arquivo `Ranking.tsx`:**

   **Para usar a mesma imagem em todos os três:**
   ```jsx
   <img
     src="/src/assets/seu-foguete.png"
     alt={`Foguete ${member.name}`}
     className="foguete-imagem"
   />
   ```

   **Para usar imagens diferentes por posição:**
   ```jsx
   {/* No início do arquivo */}
   import foguete1 from "@/assets/seu-foguete-1.png";
   import foguete2 from "@/assets/seu-foguete-2.png";
   import foguete3 from "@/assets/seu-foguete-3.png";

   {/* Depois, na renderização, altere: */}
   const fogueteImages = [foguete3, foguete2, foguete1]; // ordem: posição 0, 1, 2
   
   <img
     src={fogueteImages[i]}
     alt={`Foguete ${member.name}`}
     className="foguete-imagem"
   />
   ```

## Timeline das Animações

```
T = 0s     → Página carrega, foguetes renderizados (invisíveis)
T = 2.0s   → Foguete #3 começa a animar (entrar da esquerda-inferior)
T = 2.2s   → Foguete #1 começa a animar
T = 2.4s   → Foguete #2 começa a animar
T = 3.2s   → Foguete #3 chega à posição e inicia flutuação
T = 3.2s   → Textos do foguete #3 fazem fade-in
T = 3.4s   → Foguete #1 chega à posição e inicia flutuação
T = 3.4s   → Textos do foguete #1 fazem fade-in
T = 3.6s   → Foguete #2 chega à posição e inicia flutuação
T = 3.6s   → Textos do foguete #2 fazem fade-in
T = 3.5s+  → Foguetes flutuando continuamente
```

## Arquivos Modificados

1. **`src/styles/ranking-foguetes.css`** - Novas animações e estilos
2. **`src/pages/Ranking.tsx`** - Componente com lógica de animação
3. **`src/styles/ranking-animations.css`** - (Mantido para compatibilidade)

## Personalizações Avançadas

### Ajustar Velocidade de Entrada
Edite em `ranking-foguetes.css`:
```css
@keyframes fogueteEntrada {
  /* Mude "1.2s" para a duração desejada */
  /* Valores menores = entrada mais rápida */
  animation: fogueteEntrada 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

### Ajustar Altura de Flutuação
Edite em `ranking-foguetes.css`:
```css
@keyframes foguetePairar {
  50% {
    /* Aumente "-16px" para flutuar mais */
    transform: translateY(-16px);
  }
}
```

### Ajustar Duração de Flutuação
Edite em `ranking-foguetes.css`:
```css
.foguete-item.animacao-flutuacao {
  animation: 
    fogueteEntrada 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    foguetePairar 3.2s ease-in-out 1.2s infinite; /* Mude "3.2s" */
}
```

### Ajustar Delay de Textos
Edite em `Ranking.tsx`, a função `useEffect`:
```javascript
const timerTextos = setTimeout(() => {
  setTextoAtivo(true);
}, 3500); // Mude este valor em milissegundos
```

## Notas Técnicas

- **Z-index**: O overlay usa z-index: 40 (alto, mas não máximo, para não bloquear toasts/modais críticos)
- **Pointer Events**: Desativado no overlay para não bloquear interações com elementos abaixo
- **Performance**: Animações usam `transform` e `opacity` (otimizadas para GPU)
- **Browser Support**: Funciona em todos os navegadores modernos (Chrome, Firefox, Safari, Edge)

## Se Houver Problemas

Se as imagens não aparecerem:
1. Verifique o caminho exato do arquivo em `/frontend/src/assets/`
2. Certifique-se de usar o import com `@/assets/` para estáticos
3. Tente adicionar `alt` text como fallback
4. Verifique se o arquivo é válido (não corrompido) usando abrir no navegador direto

Se as animações não funcionarem:
1. Limpe o cache do navegador (Ctrl+F5)
2. Verifique o console para erros (F12 → Console)
3. Certifique-se de que `ranking-foguetes.css` foi importado corretamente
