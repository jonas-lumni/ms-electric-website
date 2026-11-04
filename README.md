# M&S Electric — site em Next.js

Recriação do site WordPress (https://mse.cistage.com/) em **Next.js 16 + React 19 (Node.js)**,
com os mesmos textos, cores, fontes, imagens e layout responsivo, mais os ajustes do guia de SEO/AIO
(ver [docs/SEO-relatorio.md](docs/SEO-relatorio.md)) e da auditoria de UI/UX (ver [docs/UX-relatorio.md](docs/UX-relatorio.md)).
Os dois relatórios listam o que foi feito e o que depende do cliente.
Estudos de caso: [docs/CASES-relatorio.md](docs/CASES-relatorio.md).
Segurança: [docs/SEGURANCA.md](docs/SEGURANCA.md) (cabeçalhos, CSP, dependências, pendências de hospedagem).

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm start        # serve o build
npm run seo:check  # checagem de SEO/AIO (com o build rodando); obrigatória após toda mudança
```

A regra completa da checagem está em [CLAUDE.md](CLAUDE.md).

> Os scripts chamam `node node_modules/next/dist/bin/next` direto (em vez de `next`) porque
> no Windows o `&` do nome da pasta "M&S Electric Website" quebra os atalhos do npm.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `src/app/layout.tsx` | Layout raiz: `<Header />`, página, `<Footer />` e os comportamentos (menu, sliders) |
| `src/components/Header.tsx` / `Footer.tsx` | Cabeçalho e rodapé, reaproveitados em todas as páginas |
| `src/components/SiteBehavior.tsx` | JS do site: item ativo do menu, dropdown, menu mobile, carrosséis (Splide), acordeão. Formulários só visuais (envio bloqueado) |
| `src/app/<rota>/page.tsx` | Uma página por rota (gerada pelo script) |
| `src/lib/site.ts` | Dados do negócio (NAP, horário, domínio) usados no schema, robots e sitemap |
| `src/lib/seo.ts` | Title, description, keywords e canonical de cada página; lista do sitemap |
| `src/components/PageSchema.tsx` | Dados estruturados JSON-LD (Electrician, WebSite, WebPage, Service) |
| `src/app/robots.ts` / `sitemap.ts` / `not-found.tsx` | robots.txt, sitemap.xml e página 404 |
| `next.config.mjs` | Redirecionamentos 301/308 das URLs antigas (manter por ≥ 1 ano) |
| `scripts/seo-adjustments.mjs` | Ajustes de SEO/UX aplicados pelo gerador: títulos, NAP, links, formulários, correções de texto |
| `src/lib/case-studies.ts` | Conteúdo dos estudos de caso (ver docs/CASES-relatorio.md) |
| `src/app/case-studies/` | Hub e modelo dos estudos de caso (`[slug]`), estilos em `src/styles/case-studies.css` |
| `src/components/MobileCtaBar.tsx` | Barra fixa "Call / Get a Quote" no celular |
| `src/proxy.ts` | Content-Security-Policy com nonce (cabeçalhos estáticos ficam em `next.config.mjs`) |
| `src/app/error.tsx` / `global-error.tsx` | Páginas de erro genéricas |
| `src/app/privacy-policy/` / `cookies-policy/` | Políticas escritas à mão (não geradas pelo script) |
| `.npmrc`, `.github/` | Instalação sem scripts, Dependabot e CI (audit + build + checagem) |
| `src/styles/ux.css` | Estilos dos ajustes de UX (rótulos do formulário, barra mobile, botão de pausa do carrossel) |
| `src/styles/wordpress/` | CSS do tema (Bricks + Automatic.css), na mesma ordem do WordPress |
| `src/styles/pages/` | CSS gerado pelo Bricks para cada página |
| `public/wp-content/uploads/` | Todas as imagens do site, salvas localmente |
| `public/fonts/` | Fonte Archivo (Google Fonts) hospedada localmente |
| `scripts/clone-wordpress.mjs` | Script que gerou tudo a partir do site WordPress (`npm run clone` refaz) |
| `scripts/seo-report.json` | Title/description de cada página no original |

## Páginas

| Rota | Página | No menu/rodapé |
| --- | --- | --- |
| `/` | Home | sim |
| `/about/` | About (com a antiga Our Story: história, valores e equipe; `/about-us/` redireciona) | sim |
| `/services/` | Services (antes `/servicesss/`, que agora redireciona) | sim |
| `/markets/` | Markets | sim |
| `/case-studies/` | Case Studies (hub) + 2 casos: `/case-studies/kmg-hotels-hotel-development/`, `/case-studies/construction-brokers-elevator-electrical/` | sim |
| `/contact/` | Contact | sim |
| `/privacy-policy/` | Privacy Policy | rodapé |
| `/cookies-policy/` | Cookies Policy | rodapé |
| — | Single Service: modelo com textos de exemplo, **não publicado** (`src/app/_templates/single-service/`, sem URL) | não |

URLs com barra no final, como no WordPress.

## Pontos herdados do site original

- **Links "View Case Study"** apontavam para `?page_id=1183` (rascunho que dá 404). O carrossel deles saiu da home (dados falsos).
- **Formulários:** só o visual; o envio será feito em outra fase.
- Os links internos são `<a>` normais (carregamento completo da página, como no WordPress): cada página
  traz o próprio CSS do Bricks e o Next.js não descarrega CSS na navegação client-side.

## Pendências (atualizado em 04/11/2026)

Detalhes nos relatórios em `docs/`.

**Entrega**
- Subir o ZIP no Google Drive e enviar ao Lucas; o Lucas cria o repositório no GitHub.

**A empresa precisa enviar**
- Logos reais dos clientes (4), para a faixa "Trusted by" (o Breandan envia).
- Licenças do lado do Kansas, seguros (seguradora e coberturas) e nome jurídico.
- Faturamento anual (define se a CCPA se aplica).
- Avisar a Breandan das mudanças no texto da CBI (sem 2014, título novo).
- Estudos de caso: confirmar o Ben como contato de propostas, enviar o PDF de pré-qualificação e mais casos (meta: 6 a 8).

**Fotos**
- Obra da CBI: 1 capa e de 6 a 12 para a galeria.
- Fotos reais no lugar das de banco ou feitas por IA (11): faixa de CTA do rodapé, topo de Home, About, Services e Markets, imagens da About e dos setores (data center, escritórios, estacionamento, apartamentos, residência para idosos).
- Opcional: local e projeto de cada foto; confirmar se as fotos da linha do tempo são reais.

**Hospedagem e segurança (desenvolvedor da M&S)**
- HTTPS, WAF, DNS (DNSSEC, CAA, SPF, DKIM, DMARC), 2FA nas contas, proteções do GitHub.
- Proteger com senha o staging `mse.cistage.com`.
- Depois de publicar: Search Console, Bing Webmaster Tools, GA4, monitor de uptime, Core Web Vitals.

**SEO local e jurídico**
- Google Business Profile, Bing Places, Apple Business e diretórios com o mesmo NAP.
- Revisão da Privacy Policy por um advogado americano.

**Próximas fases (código)**
- Formulários funcionando (validação, Turnstile, limite de envios, GoHighLevel).
- Páginas novas com dados da empresa: serviços, setores, Licenses & Insurance, Safety, Careers, cidades.
- Filtros nos estudos de caso quando houver cerca de 6.
