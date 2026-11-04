# Relatório de UI/UX — M&S Electric (Next.js)

Aplicação do documento "Auditoria de UI e UX do mse.cistage.com". Data: 28/10/2026.
Formato pedido pela auditoria: URL / problema / o que foi mudado / como verificar.

## 1. Itens corrigidos

| # | URL | Problema | O que foi mudado | Como verificar |
|---|---|---|---|---|
| C1 | todas | Title e alt do logo com o domínio da Hostinger | Title por página; alt "M&S Electric" (já feito na etapa de SEO) | `npm run seo:check` |
| C2 | todas | Canonical para o staging | Canonical para `https://mandselectric.net/...` (etapa de SEO). O noindex/senha do staging WordPress fica com a hospedagem | `seo:check` |
| C3 | /, /about/, /services/, /markets/ | 48 links para `?page_id=1183` | "Learn more" de serviços → seção do serviço em `/services/`; de setores → seção do setor em `/markets/`; ícones de "Why M&S is Different" → seção do serviço; "See Why GCs Choose Us" → `/about-us/`. Sem destino real (projetos), foram **removidos**: "View Case Study", "View All Case Studies", "View Our Projects" e os "Learn more" dos cards da própria `/services/` e `/markets/` | `seo:check` acusa qualquer `href="#"` ou `page_id=` |
| C4 | todas | Mapa com rota a partir de Fortaleza e CEP 64014 | Link de busca pelo endereço certo (etapa de SEO) | clicar no endereço do rodapé |
| C5 | todas | "Blue Spring, Mo" | "3026 SW East US 40 Hwy, Blue Springs, MO 64015" (etapa de SEO) | `seo:check` |
| C6 | todas | Sem H1, tudo H3 | 1 H1 por página, H2/H3 em ordem; números e nomes viraram `<p>` (etapa de SEO) | `seo:check` |
| C7 | / e demais com o bloco de CTA | Telefone do bloco "Start with an energy audit…" era texto simples | Virou link `tel:+18164275913`. Os demais telefones e o "Emergency? Call Now" já eram links | `seo:check` confere todos os `tel:` |
| I1 | formulários (todas as páginas com o bloco de CTA e /contact/) | Só placeholders, faltavam setores, sem autocomplete | Rótulo visível `<label for>` acima de cada campo com "(required)/(optional)"; `autocomplete` (name, organization, email, tel); campo opcional **Company**; Property Type com os 8 setores + Other; Name e Email obrigatórios | `seo:check` acusa campo sem label/autocomplete |
| I3 | /, /services/, /markets/ | "5.0 ⭐" nos depoimentos sem fonte | Removido o selo "5.0 ⭐" dos 3 depoimentos. Nenhum `Review/AggregateRating` no schema | visual |
| I4 | menu | Slug `/servicesss/` | `/services/` com 308 da antiga (etapa de SEO) | `seo:check` |
| I5 | /, /services/, /markets/ | 13 "Learn more" iguais e links-ícone sem texto | `aria-label` descritivo ("Learn more about Fire Alarm Systems"…), começando pelo texto visível (WCAG 2.5.3) | `seo:check` acusa texto genérico sem aria-label |
| I7 | /, /contact/, /services/ | Sem schema | JSON-LD Electrician + WebSite + Service (etapa de SEO) | `seo:check` |
| I8 | /, /services/, /markets/ | "relationship matter most"; "Hotel" no singular | "relationships matter most"; "Hotels" | visual |
| I9 | todas (celular) | Sem CTA fixo no mobile | Barra fixa abaixo de 768px com "Call (816) 427-5913" e "Get a Quote", botões de 48px, com espaço reservado no fim da página e escondida com o menu mobile aberto | celular: botões no rodapé da tela |
| 4. A11y | / | Carrossel de projetos com autoplay sem pausa (WCAG 2.2.2) | Botão "Pause/Play" (44px) e pausa ao passar o mouse ou focar | botão no canto do carrossel |
| 4. A11y | todas | Links "Skip to main content/footer" do WordPress haviam se perdido no clone | Recolocados (aparecem ao navegar com Tab) | Tab ao abrir a página |
| 2. | todas | Página atual no menu | `aria-current="page"` (já existia) | — |
| 5. | todas | Title 50–60 e description 140–160 | Ajustados; o limite de 155 do guia de SEO também é respeitado | `seo:check` |

Foco visível: o tema já aplica `outline: auto` em `:focus-visible` em todo o site. Zoom: viewport sem bloqueio.

## 2. Changelog de texto visível (antes → depois)

| Onde | Antes | Depois |
|---|---|---|
| "Who we serve" e Markets | Hotel | Hotels |
| "Who we serve" | …long-term relationship matter most | …long-term relationships matter most |
| Depoimentos | selo "5.0 ⭐" | (removido) |
| Formulários | só placeholders | rótulos "Name (required)", "Company (optional)", "Email (required)", "Phone (optional)", "Property Type (optional)", "Message (optional)"; campo Company novo |
| Property Type | Shopping Center, Multi-Family, Senior Living, Office, Other | Shopping Center, Hotel, Multi-Family, Medical, Senior Living, Office, Data Center, Government, Other |
| Projetos (home) | botões "View Case Study" / "View All Case Studies" | (removidos até existir a página de projetos) |
| About, card "Our Work" | botão "View Our Projects" | (removido até existir a página de projetos) |
| /services/, /markets/ cards | botões "Learn more" sem destino | (removidos) |
| Celular | — | barra "Call (816) 427-5913" / "Get a Quote" |

## 3. Decisões e conflitos

- **Open Graph (I6):** liberado pelo Lucas como exceção à regra 4 do guia de SEO. Implementado em `src/lib/seo.ts` e `src/app/opengraph-image.tsx`.
- **Formulário:** continua só visual (envio bloqueado), como combinado. A mensagem de sucesso, os erros junto ao campo e o anti-spam entram na fase dos formulários.
- **Carrossel → grade estática (C9/D4):** não troquei, porque o carrossel repete o mesmo projeto 3 vezes e uma grade precisa de 3 cases reais diferentes.

## 4. Respostas da empresa (28/10/2026), já aplicadas

C8 (ano 2011, horário 8 AM – 5 PM, emergência 24/7, e-mail services@), C9 (projetos falsos → carrossel removido),
I2 (licença #954634 e prêmio STEP no rodapé e no schema), I3 (depoimentos autorizados), I10 (fazem auditoria de
energia: CTA mantido), D3 (crédito mantido), prazo de resposta (24 h, abaixo do formulário), H1 da home com local,
breadcrumb visível e /single-service/ fora do ar. Também: I4 (About e Our Story numa página só, `/about-us/` → `/about/`) e I6 (Open Graph completo com imagem 1200x630). Detalhes em docs/SEO-relatorio.md, seção 3.

## 4.1 Pendências

1. **Logos "Trusted by…"** (são do tema): o Breandan vai enviar os reais.
2. **Projects:** página com cases reais, quando existirem.

## 5. Fora do código / ainda não medido

- Staging WordPress: noindex + senha (C2). Em produção: HTTPS, www → apex, cache/CDN.
- Lighthouse (Acessibilidade ≥ 95, SEO ≥ 95, Desempenho ≥ 85) e Core Web Vitals: medir no ambiente final.
- Teste com leitor de tela (NVDA/VoiceOver) e em celular real (iOS/Android) para os links `tel:`.
- GA4 com `generate_lead` e `phone_click`: entra junto com os formulários.
- Páginas novas sugeridas (D5): uma por serviço, uma por setor, Projects e cases. Dependem de conteúdo real.
