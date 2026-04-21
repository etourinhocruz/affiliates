# Mansão Green Affiliates — Design System

Documento de referência para o padrão visual, de interação e de código do painel de afiliados. Todas as novas telas e componentes devem seguir estas regras para manter a identidade premium dark mode da plataforma.

---

## 1. Princípios

1. **Premium Dark First** — o produto nasce em dark mode. Qualquer superfície clara deve ser justificada pelo contexto (estados de sucesso, badges específicas).
2. **Clareza acima de decoração** — hierarquia tipográfica e uso intencional de cor vêm antes de qualquer efeito visual.
3. **Microinterações com propósito** — animações existem para guiar o olhar e dar feedback, nunca como ornamento.
4. **Responsividade verdadeira** — cada componente precisa funcionar de 360px a 1440px+.
5. **Single Responsibility** — cada tela resolve um objetivo; ações secundárias vão para modais, drawers ou rotas próprias.
6. **Acessibilidade de contraste** — texto sobre qualquer background respeita contraste mínimo AA.

---

## 2. Fundamentos de Cor

### 2.1 Background

| Token | Valor | Uso |
|---|---|---|
| `bg-slate-950` | `#020617` | Background global da aplicação |
| `#14141A` | `#14141A` | Dropdowns, popovers, surfaces flutuantes |
| `#1E1E24` | `#1E1E24` | Cards primários (KPIs, pillars) |
| `#1A1F1C` / `#14201A` | gradiente | Painel financeiro de destaque |

### 2.2 Paleta Neon (Verde — cor principal da marca)

Configurada em `tailwind.config.js` como `neon.100 → neon.700`.

| Token | Hex | Uso primário |
|---|---|---|
| `neon.300` | `#7CFF58` | Textos de destaque, ícones ativos |
| `neon.400` | `#39FF14` | CTA primário, glow, linhas de gráfico |
| `neon.500` | `#1FE600` | Hover de CTA |

Shadows utilitárias:
- `shadow-neon` → `0 0 24px rgba(57,255,20,0.45)`
- `shadow-neon-sm` → `0 0 12px rgba(57,255,20,0.6)`

### 2.3 Ramps de Apoio

Cores obrigatórias para comunicar semântica — **nunca** usar violeta/indigo/roxo fora do contexto de comissões financeiras no gráfico "Minhas Comissões".

| Função | Ramp | Exemplos de uso |
|---|---|---|
| Primária (marca) | Neon green | CTAs, métricas de sucesso, destaques |
| Secundária | `sky-300/500` | Conversões, FTD, métricas informativas |
| Accent | `amber-300/400` | Métricas neutras (Value Player, conversões intermediárias) |
| Success | `emerald-500` | Confirmações, fundos de painel financeiro |
| Warning | `amber-500` | Avisos não críticos |
| Error | `rose-300/400/500` | Deltas negativos, erros de formulário |
| Financeiro (exceção) | `fuchsia-200` / `#A855F7` | Exclusivamente para a métrica "Comissão" no gráfico combinado |
| Neutros | `slate-200 → slate-950` | Texto, bordas, divisores, backgrounds |

### 2.4 Regras de Cor

- **Proibido** roxo/indigo/violeta como cor decorativa ou default de UI.
- Texto principal: `text-white` ou `text-slate-200`.
- Texto secundário: `text-slate-400`.
- Texto sutil/placeholder: `text-slate-500`.
- Bordas: `border-white/5` (padrão) ou `border-white/10` (hover/ativa).
- Superfícies translúcidas: `bg-white/[0.02]` a `bg-white/[0.05]`.

---

## 3. Tipografia

- Fonte: **Inter** (via Google Fonts, carregada em `src/index.css`).
- Fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- Pesos permitidos: **400, 500, 600, 700** (máx. 3 pesos por tela).
- Line-height: **1.5** no corpo; **1.2** em títulos (`h1..h4`).
- Escala sugerida:

| Token | Classe | Uso |
|---|---|---|
| Display | `text-3xl font-semibold tracking-tight` | Títulos de seção principal |
| H2 | `text-2xl font-semibold` | Cabeçalhos de tela |
| H3 | `text-base font-semibold` | Títulos de card |
| Body | `text-sm text-slate-300/400` | Texto padrão |
| Caption | `text-xs text-slate-400/500` | Legendas, footers |
| Eyebrow | `text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400` | Labels de métrica |

Números de destaque devem usar `font-bold` ou `font-extrabold` e, quando apropriado, receber `drop-shadow` neon/âmbar para brilho premium.

---

## 4. Espaçamento e Grid

- Base: **sistema de 8px** (Tailwind default `1` = 4px).
- Padding interno de cards: `p-5 sm:p-6` (cards) ou `p-6 sm:p-8` (painéis destaque).
- Gaps entre elementos relacionados: `gap-2` / `gap-3`.
- Gaps entre cards: `gap-4` (mobile) → `gap-6` (desktop).
- Margens entre seções: `mt-6` / `mb-8` / `mb-10`.
- Container principal: `max-w-7xl` com `px-4 sm:px-6 lg:px-10`.
- Sidebar reserva `lg:pl-72` no conteúdo.

Breakpoints Tailwind usados: `sm (640)`, `md (768)`, `lg (1024)`, `xl (1280)`.

---

## 5. Superfícies e Bordas

- **Cards padrão**: `rounded-2xl border border-white/5 bg-[#1E1E24]/70 backdrop-blur-md`.
- **Painéis de destaque**: `rounded-3xl` com gradiente + blur glows.
- **Bordas separadoras**: `border-white/5` (internas) / `border-white/10` (hover).
- **Backdrop filter**: usar `backdrop-blur-md` ou `backdrop-blur-xl` em superfícies com transparência.
- **Glows**: círculos `blur-3xl` absolutos em tom da marca (neon) ou semântico (`emerald-500/10`, `fuchsia-500/10`) atrás do conteúdo principal.

### Glassmorphism (regras)
- Usar apenas quando houver um background com textura ou gradiente por trás.
- Combinar sempre com `border-white/5` e tonalidade de fundo `bg-white/[0.02..0.05]`.
- Nunca empilhar dois níveis de glass consecutivos (vira "sopa").

---

## 6. Elevação e Sombras

| Nível | Uso | Classe |
|---|---|---|
| 0 | Plano (texto/ícone) | — |
| 1 | Card em repouso | Sem sombra, apenas border |
| 2 | Card hover | `hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]` |
| 3 | Painéis premium | `shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]` |
| Glow neon | CTAs e números-chave | `shadow-[0_0_32px_rgba(57,255,20,0.4)]` |

---

## 7. Border Radius

- `rounded-lg` (8px) — ícones em bolsa, botões pequenos.
- `rounded-xl` (12px) — tooltips, dropdowns.
- `rounded-2xl` (16px) — cards e chart containers.
- `rounded-3xl` (24px) — painéis financeiros e heroes.
- `rounded-full` — avatars, pills, dots de legenda.

---

## 8. Componentes Base

### 8.1 Botões
- **Primário**: `bg-neon-400 text-slate-950 font-bold uppercase tracking-[0.18em] rounded-2xl px-6 py-4 shadow-neon hover:bg-neon-300`.
- **Secundário**: `border border-white/10 bg-slate-900/70 text-slate-200 rounded-xl px-3.5 py-2 hover:border-neon-400/40 hover:text-white`.
- **Terciário / Tab**: `text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-3 py-1.5`.
- Estados ativos usam ring: `ring-1 ring-neon-400/30 bg-neon-400/10 text-neon-400`.

### 8.2 Badges / Pills
- Delta positivo: `bg-neon-400/10 text-neon-300 ring-1 ring-neon-400/30`.
- Delta negativo: `bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30`.
- Status: raio `rounded-full`, altura `px-2 py-0.5`, tipografia `text-[11px] font-semibold`.

### 8.3 Inputs
- Fundo `bg-slate-900/70`, borda `border-white/10`, foco `focus:border-neon-400/40 focus:ring-1 focus:ring-neon-400/20`.
- Placeholder em `text-slate-500`.

### 8.4 Dropdowns / Popovers
- Container: `rounded-xl border border-white/10 bg-[#14141A] shadow-xl`.
- Item ativo: `bg-neon-400/10 text-neon-300`.
- Item hover: `hover:bg-white/5 text-slate-300`.

### 8.5 KPI / Pillar Cards
- Layout: label eyebrow + ícone em `rounded-lg bg-white/5 p-2`.
- Valor: `text-2xl font-bold text-white`.
- Footer separado por `border-t border-white/5 pt-3`.
- Hover: `hover:-translate-y-1` + linha neon na base via gradiente pseudo-border.

### 8.6 Gráficos (Recharts)
- `CartesianGrid`: `stroke="rgba(255,255,255,0.05)"`, sem verticais.
- Eixos: `stroke="#64748b"`, `fontSize={11..12}`, `tickLine={false}`, `axisLine={false}`.
- Tooltip: `bg rgba(10,10,14,0.95)`, `border rgba(255,255,255,0.08)`, `rounded-xl`, `box-shadow 0 12px 40px rgba(0,0,0,0.6)`.
- Em `ComposedChart` com `Line`, **desabilitar** cursor default: `cursor={false}` para evitar linhas verticais indesejadas.
- Gradientes em barras usam `stopOpacity 0.95 → 0.65`.
- Linha de métrica financeira: `strokeWidth 2.5`, `filter glowPurple` (gaussian blur 2.6), dots com `stroke-white`.

---

## 9. Iconografia

- Biblioteca única: **lucide-react** (`0.344.0`).
- Tamanhos padrão: `h-3.5 w-3.5` (inline), `h-4 w-4` (botões), `h-5 w-5` (cards), `h-11 w-11` wrapper (hero icons).
- Ícones de seção ficam dentro de bolsa circular/quadrada com `bg-white/5` ou gradiente `from-neon-400/20 to-fuchsia-500/10` com `ring-1 ring-white/10`.
- Ícones hover em cards ganham cor neon: `group-hover:text-neon-300`.

---

## 10. Movimento e Animação

Keyframes globais em `src/index.css`:

- `fadeIn` — opacity + translateY(8px → 0).
- `riseUp` — opacity + translateY(14px → 0), 520ms `cubic-bezier(0.22, 1, 0.36, 1)`.
- Utilitária `animate-rise` em seções e cards com `animationDelay` escalonado (60ms, 120ms, 180ms, …).

Regras:
- Transições de estado: `transition-all duration-300` (padrão) ou `duration-200` (itens interativos rápidos).
- Hover translate: no máximo `-translate-y-1` em cards.
- Micro-rotações para chevrons: `rotate-180`.
- Evitar animações acima de 600ms em elementos de UI; reservar durações maiores para entradas de página.

---

## 11. Estados e Feedback

- **Hover**: borda → `white/10`, translate leve, glow/linha neon quando aplicável.
- **Foco**: ring neon discreto (`ring-1 ring-neon-400/30`).
- **Disabled**: `opacity-50 cursor-not-allowed` + remover hover.
- **Loading**: skeletons em `bg-white/5 animate-pulse rounded-xl`.
- **Empty state**: ícone lucide + título + subtítulo curto em `text-slate-400` + CTA secundário.
- **Erro**: texto `text-rose-300` + fundo `bg-rose-500/10` quando em card.

---

## 12. Layout e Progressive Disclosure

- Sidebar fixa à esquerda (≥lg), colapsável em drawer no mobile.
- Header sticky com contexto do usuário.
- Conteúdo principal paginado por rota lógica (`overview`, `deals`, `campaigns`, `reports`, `settings`).
- Ações secundárias/edições abrem em **modais, drawers ou subpáginas** — nunca empilham no card principal.
- Uso de `animate-rise` com delay crescente para revelar seções em cascata.

---

## 13. Formatação de Dados

- Moeda: `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Datas curtas: `dd/MM` em eixos e chips.
- Números inteiros: `toLocaleString('pt-BR')`.
- Percentuais: 1 casa decimal (`toFixed(1)`).
- Sempre prefixar deltas: `+` para positivos, `-` já vem do sinal.

---

## 14. Acessibilidade

- Contraste mínimo 4.5:1 para texto body, 3:1 para UI graphics.
- Hit areas mínimos: 36×36px.
- `aria-label` em botões puramente icônicos.
- Foco sempre visível (nunca `outline: none` sem ring customizado).
- Estrutura semântica: `main`, `section`, `header`, `nav`.

---

## 15. Padrões de Código

- **Stack obrigatório**: Vite + React 18 + TypeScript + TailwindCSS + lucide-react + recharts + Supabase.
- **Persistência**: sempre via Supabase; nunca criar tabelas custom de auth.
- **RLS**: obrigatória em toda tabela nova.
- **Componentes**: arquivos enxutos em `src/components/*`; uma responsabilidade por arquivo.
- **Estilo**: 100% via classes Tailwind — evitar CSS-in-JS e arquivos `.css` paralelos (exceto `index.css`).
- **Ícones**: sempre lucide-react; proibidos pacotes alternativos de UI/ícones.
- **Imagens**: preferir Pexels com URL pública; nunca baixar assets.
- **Sem comentários decorativos**; apenas quando o "porquê" não é óbvio.

---

## 16. Checklist para Novas Telas

- [ ] Dark mode premium aplicado.
- [ ] Cores dentro da paleta autorizada (sem roxo/indigo fora do gráfico de comissões).
- [ ] Espaçamento em múltiplos de 8px.
- [ ] Tipografia Inter com no máximo 3 pesos.
- [ ] Contraste de texto verificado em todos os backgrounds.
- [ ] Hover, foco e empty state definidos.
- [ ] Animações `animate-rise` ou equivalentes em entradas.
- [ ] Responsivo de 360px a 1440px.
- [ ] Dados persistidos em Supabase com RLS.
- [ ] Nenhum asset ou dependência fora do stack autorizado.
