# Relatório de SEO/AIO — M&S Electric (Next.js)

Aplicação do documento "Guia de SEO e AIO para o site da M&S Electric em Kansas City".
Data: 28/10/2026. Domínio de produção assumido: `https://mandselectric.net` (configurado em `src/lib/site.ts`).

## 1. O que foi feito no código (e verificado)

| Item do guia | O que foi feito | Onde | Verificação |
|---|---|---|---|
| 1.1.3 Referências ao ambiente antigo | Nenhuma ocorrência de `mse.cistage.com` / nome provisório do WordPress no HTML gerado | gerador + `seo-adjustments.mjs` | `curl` nas páginas: 0 ocorrências ✅ |
| 1.1.4 / 1.1.6 Redirecionamentos 301/308 | URLs antigas de mandselectric.net mapeadas para as novas, num salto; comentário pedindo para manter por ≥ 1 ano | `next.config.mjs` | `/our-services/` → `/services/` (308) ✅ |
| 1.1.5 Host canônico | `www.mandselectric.net` → `mandselectric.net` (mantendo a barra) | `next.config.mjs` | ✅ (HTTP→HTTPS fica com a hospedagem) |
| 1.2.1 robots.txt | Modelo do guia (busca e treinamento de IA liberados) + Sitemap | `src/app/robots.ts` | `/robots.txt` 200 text/plain ✅ |
| 1.2.3 Sitemap | Só URLs canônicas e indexáveis (sem a página modelo Single Service) | `src/app/sitemap.ts`, `src/lib/seo.ts` | `/sitemap.xml` com 8 URLs ✅ |
| 1.3.1 Canonical | Canonical absoluto e autorreferente em todas as páginas | `src/lib/seo.ts` | ✅ |
| 1.3.2 URLs | `/servicesss/` virou `/services/` (com 308 da antiga); links internos atualizados | gerador | menu ativo ok ✅ |
| 1.3.3 404 real | Página 404 com navegação, telefone e links para serviços; status 404 + noindex automático | `src/app/not-found.tsx` | `curl` → 404 ✅ |
| 1.3.4 lang | `<html lang="en-US">` | layout | ✅ |
| 1.5.1 Conteúdo no HTML do servidor | Páginas estáticas: texto, carrosséis, acordeão e JSON-LD já vêm no HTML | — | `curl -A GPTBot` encontra o texto ✅ |
| 1.5.2 Links rastreáveis | `<a href>` reais | — | ✅ |
| 1.7.1 Telefone clicável | O link do telefone no topo discava outro número (+1 816-599-8562); agora todos usam +1 816-427-5913 | `seo-adjustments.mjs` | ✅ |
| 1.8.2 Alt do logo | Logo com `alt="M&S Electric"` | `seo-adjustments.mjs` | ✅ |
| 1.8.3 Lazy load | Imagens abaixo da primeira dobra com `loading="lazy"`; topo e cabeçalho sem lazy | gerador | ✅ |
| 2.1 / 2.2 Title e description | Únicos por página, title ≤ 70 e description ≤ 155 caracteres | `src/lib/seo.ts` | ✅ |
| 2.3 Keywords e author | 2 a 4 termos por página; `author` = M&S Electric | `src/lib/seo.ts`, layout | só metatags permitidas no `<head>` ✅ |
| 2.4 Headings | O WordPress usava só H3. Agora há 1 H1 por página, H2 nas seções e H3 abaixo; rótulos e números viraram `<p>` com o mesmo visual | `seo-adjustments.mjs`, `src/styles/seo-headings.css` | 0 saltos de nível; visual comparado com o original em desktop e celular: igual ✅ |
| 3.1.1 NAP | Rodapé: "3026 SW East US 40 hwy, Blue Spring, Mo 64015, US" → "3026 SW East US 40 Hwy, Blue Springs, MO 64015"; o link do mapa abria rota a partir de outro lugar com CEP 64014 e agora busca o endereço certo | `seo-adjustments.mjs` | ✅ |
| 4.1 / 4.2 Schema | `Electrician` (+ `WebSite` na home) na home e no contato; demais páginas com `WebPage` referenciando o `@id` | `src/components/PageSchema.tsx` | JSON válido ✅ (rodar Rich Results Test em produção) |
| 4.3 Service | Os 5 serviços de `/services/` marcados como `Service` com `provider` | `PageSchema.tsx` | ✅ |
| 4.6 Sem Review/AggregateRating | Depoimentos ficam só como texto | — | ✅ |
| 5.4.1 llms.txt (opcional) | Criado com NAP e links | `public/llms.txt` | 200 text/plain ✅ |

## 2. Changelog de texto visível (antes → depois)

| Página | Antes | Depois | Motivo |
|---|---|---|---|
| Rodapé (todas) | 3026 SW East US 40 hwy, Blue Spring, Mo 64015, US | 3026 SW East US 40 Hwy, Blue Springs, MO 64015 | 3.1.1 NAP |
| Privacy Policy | Our website address is: https://mse.cistage.com. | Our website address is: https://mandselectric.net. | 1.1.3 |
| Títulos das abas | "X – navajowhite-chough-686724.hostingersite.com" | Ver `src/lib/seo.ts` | 2.1 |
| Privacy Policy | Texto-modelo do WordPress ("Suggested text:", comentários, Gravatar) | Política nova (CalOPPA), ver docs/SEGURANCA.md | Guia de segurança PRV-01 |
| Cookies Policy | Só o título | Política curta: o site não usa cookies | Guia de segurança PRV-03 |
| Home (H1) | From groundbreaking to long-term operations | Commercial Electrical Contractor in Kansas City | Decisão do Lucas |
| Rodapé / home | since 2005 / 2005 | since 2011 / 2011 | Cliente |
| Rodapé, contato, CTA | 8 AM – 7 PM | 8 AM – 5 PM | Cliente |
| Topo, políticas | service@mandselectric.net | services@mandselectric.net | Cliente |
| Home | Carrossel "Recent Projects" (Blue Springs Medical Center) | (removido) | Cliente: dados falsos |
| Rodapé | — | Kansas City, MO Electrical Contractor Class I License #954634 · 2026 ABC Heart of America STEP Platinum Safety Award | Cliente |
| Formulários | — | We'll get back to you within 24 hours. | Cliente |
| Páginas internas | — | Breadcrumb (Home / …) | Decisão do Lucas |
| About | Página-índice com 3 cards (Our Story, GC Advantage, Our Work) | Conteúdo da Our Story (história, valores, equipe) na própria About | Decisão do Lucas |
| Menu e rodapé | About ▸ Our Story | About | Decisão do Lucas |

Não visíveis: link `tel:` do topo, link do mapa, `alt` do logo, tags dos títulos (H3 → H1/H2/p).

## 3. Decisões do cliente e do Lucas (28/10/2026), já aplicadas

| Item | Decisão | O que mudou no site |
|---|---|---|
| Ano de fundação | 2011 | Rodapé "since 2011", número da home "2011", `foundingDate` no schema |
| Fundadores | Pai e filho (Ben e Shawn Ryan) | Nada: o site já dizia isso (o guia estava errado ao dizer "irmãos") |
| Horário | Seg–sex, 8 AM – 5 PM | Rodapé, contato, bloco de CTA, schema (`closes: 17:00`), description do /contact/, llms.txt |
| Emergência 24/7 | Existe | "Emergency? Call Now" mantido; citado no llms.txt, separado do horário comercial |
| E-mail | services@mandselectric.net | Topo, políticas, schema, description do /contact/, llms.txt |
| "Recent Projects" | Dados falsos | Carrossel removido da home |
| Depoimentos | Autorizados | Mantidos (sem o selo "5.0 ⭐", que não tinha fonte) |
| Licença e prêmio | Exibir | Linha no rodapé de todas as páginas + `hasCredential` e `award` no schema + llms.txt |
| Auditoria de energia | Fazem | Bloco de CTA mantido |
| "Made by Lumni Studio" | Manter | — |
| Prazo de resposta | 24 horas | "We'll get back to you within 24 hours." abaixo dos formulários |
| Perfis sociais | Os do site | Só o LinkedIn (o mandselectric.net não tem nenhum) |
| H1 da home | Com local | "Commercial Electrical Contractor in Kansas City" |
| /single-service/ | Não publicar | Saiu das rotas (fica em `src/app/_templates/`, sem URL) |
| Breadcrumb visível | Sim | Páginas internas, igual ao BreadcrumbList do schema |
| About × Our Story | Juntar | `/about/` = topo da About + linha do tempo, valores e equipe da Our Story; saiu o bloco "Explore M&S"; menu sem submenu; `/about-us/` → 301 para `/about/` |
| Open Graph | Liberado (exceção à regra 4 do guia) | og:title/description/url/site_name/image em todas as páginas; imagem 1200x630 gerada em `src/app/opengraph-image.tsx` |

## 4. Pendências

1. **Logos "Trusted by…" da home:** são logos de exemplo do tema (Biosynthesis, Calescence, AlphaWave…). O Breandan vai enviar os reais.
2. **Licenças além da de Kansas City, MO, seguros e razão social** (M&S Electric LLC?) para uma futura página "Licenses & Insurance": licença do lado do Kansas (Johnson County Class DE, KCK), seguradora e coberturas (responsabilidade civil, workers comp).
3. **CCPA:** confirmar o faturamento anual.
4. **Alt das fotos (1.8.2):** feito em 4/11 para 29 fotos (equipe com nome e cargo; demais descrevendo o que é visível, em `scripts/seo-adjustments.mjs`, ALT_TEXT). Ficam sem descrição só os logos de exemplo (logo-*.png), até chegarem os reais. Se a empresa informar local e projeto de cada foto, dá para enriquecer os textos.
5. **Estudos de caso:** hub e 2 casos criados (KMG Hotels, CBI); pendências em docs/CASES-relatorio.md.

## 5. Fora do código (não dá para fazer no repositório)

- 1.1.1 Proteger `mse.cistage.com` com senha (staging hoje está público e indexável).
- 1.1.2 Remover noindex do WordPress de produção (só se o WordPress continuar no ar).
- 1.2.2 WAF/CDN sem bloquear Googlebot, Bingbot e robôs de IA.
- 1.2.4 IndexNow, 1.4.1 HTTPS/HSTS, 1.6 Core Web Vitals: medir na hospedagem final.
- 3.2–3.4 Google Business Profile, Bing Places, Apple Business, diretórios e avaliações.
- 8.1 Search Console, Bing Webmaster Tools, GA4 (canal "AI Assistants") e monitoramento de prompts.

## 6. Próximas páginas (exigem dados do cliente)

Ainda não criadas, para não publicar dados inventados (regra 3 do guia):

- Páginas individuais por serviço (2.6), com `Service` e BreadcrumbList.
- `/licenses-insurance/` (6.1), `/safety/` (6.2), `/projects/` com estudos de caso (6.3, 6.4), `/careers/` (6.7).
- Páginas por cidade só com projetos reais (3.6) e hub `/service-areas/`.

## 7. URLs antigas sem equivalente (retornam 404 de propósito)

Conteúdo de demonstração do tema WordPress em mandselectric.net: `/project/*`, `/events/*`, `/tag/*`, `/category/news/`, `/projects-category/*`, `/testimonials-category/*`, `/author/*`, posts de exemplo, `/architecture/`, `/appointments/`, `/blog-masonry/`, `/blogger-gb-*`, `/events-page/`, `/projects-grid/`, `/thank_you/`. Também `/careers/`, `/faq/` e `/projects/`: criar as páginas e então adicionar o 301.
