# Segurança — M&S Electric (Next.js)

Aplicação do documento "Requisitos e checklist de segurança: site institucional M&S Electric (Next.js, 2026)".
Data: 28/10/2026.

## Contexto levantado

- **Next.js 16.4.5** (Active LTS; pacote de segurança de 3/11/2026 aplicado em 4/11), **React 19.3.1**, **sharp 0.35.5**, App Router, Node 24.
- Sem Server Actions, sem Route Handlers (`/api`), sem `next/image`, sem MDX/CMS, sem `use cache`, sem i18n.
- Sem terceiros carregados na página: sem GTM/GA4, GoHighLevel ou Turnstile. Fontes e imagens são servidas pelo próprio domínio.
- Formulários: só visuais (envio bloqueado no navegador), sem backend. GHL, Turnstile e Zod entram na fase dos formulários.
- Ainda sem repositório Git, hospedagem e domínio definidos.

## Auditoria por item

### Crítico

| ID | Status | Evidência | Ação |
|---|---|---|---|
| DEP-01 | CUMPRIDO | `npm ls`: next@16.4.5, sharp@0.35.5 (16.4.5 = pacote de segurança de 3/11/2026, aplicado em 4/11). A 15.5.28 trazia PostCSS vulnerável (alta), por isso a mudança para a 16 | Repetir a cada aviso em nextjs.org/blog/security |
| DEP-02 | PARCIAL | Processo descrito abaixo; responsável: o desenvolvedor da M&S | Ele precisa assinar os alertas; o pacote de 3/11 já está no código (16.4.5) |
| DEP-04 | CUMPRIDO | `package-lock.json`; `.npmrc` com `ignore-scripts=true` e `audit-level=high`; `npm ci` testado | Commitar o lockfile ao criar o repositório |
| HDR-02 | CUMPRIDO | `src/proxy.ts`: CSP com nonce por requisição + `'strict-dynamic'`; nonce diferente a cada resposta; 12 de 12 scripts executáveis com nonce; navegação por todas as páginas sem violação | Ao adicionar GHL/GTM/Turnstile: incluir os domínios e testar com `CSP_REPORT_ONLY=1` |
| FRM-01 | NÃO SE APLICA (ainda) | Formulários sem backend | Na fase dos formulários: Zod no servidor |
| FRM-06 | NÃO SE APLICA (ainda) | Nenhuma chamada ao GHL | Na fase dos formulários: PIT só no servidor |
| ENV-01 | CUMPRIDO | Nenhuma `NEXT_PUBLIC_*` no código; `.next/static` sem "hooks/", "Bearer", "SECRET" ou "GHL_" | — |
| ENV-04 | PARCIAL | `.gitignore` ignora `.env*` (exceto `.env.example`, só com nomes) | VERIFICAÇÃO MANUAL: rodar `gitleaks detect` quando houver repositório; segredos no painel da hospedagem |
| INF-01 | VERIFICAÇÃO MANUAL | HSTS já enviado; `www` → domínio sem www já configurado (`next.config.mjs`) | Na hospedagem: certificado, HTTP → HTTPS (301), TLS 1.2/1.3, SSL Labs A |

### Alto

| ID | Status | Evidência | Ação |
|---|---|---|---|
| DEP-03 | CUMPRIDO | `.github/dependabot.yml` (npm + actions, grupo next/react) | No GitHub: ativar "Dependabot security updates" e "Secret scanning" |
| DEP-05 | CUMPRIDO | `.github/workflows/ci.yml`: `npm ci --ignore-scripts`, `npm audit --omit=dev --audit-level=high`, build e `seo:check` | — |
| DEP-07 | CUMPRIDO | Só `src/proxy.ts` (sem `middleware.ts`), e ele só define cabeçalhos | Validações futuras dentro do handler/action |
| HDR-01 | CUMPRIDO | `next.config.mjs`: HSTS (sem `preload`), nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP, CORP; `poweredByHeader: false` | `preload` só depois de confirmar HTTPS em todos os subdomínios |
| FRM-02 a FRM-05 | NÃO SE APLICA (ainda) | — | Fase dos formulários (escape de saída, Turnstile + honeypot, rate limit, checagem de `Origin`) |
| GHL-01 | NÃO SE APLICA (ainda) | Sem calendário | Ao incluir: iframe com `title`, `sandbox`, CSP `frame-src` para o GHL |
| BLG-02/03 | NÃO SE APLICA | Sem CMS | — |
| ENV-02 | NÃO SE APLICA (ainda) | Sem módulos com segredo | `import 'server-only'` em `lib/ghl.ts` e `lib/turnstile.ts` quando existirem |
| CFG-02 | CUMPRIDO | `images`: sem `remotePatterns`, `dangerouslyAllowSVG: false`; `/_next/image` com URL externa → 400 | — |
| INF-03 / INF-05 / INF-06 | VERIFICAÇÃO MANUAL | Dependem de hospedagem, DNS e GitHub | WAF/rate limit na borda; SPF/DKIM/DMARC; `main` protegida e previews com senha |
| PRV-01 | PARCIAL | Política de privacidade reescrita (o texto-modelo do WordPress, com "Suggested text:", Gravatar e comentários, saiu): dados coletados, uso, compartilhamento, rastreamento de terceiros, **Do Not Track**, como revisar/corrigir, mudanças, **data de vigência**, contato; link "Privacy Policy" no rodapé de todas as páginas | **Revisão por advogado americano**; atualizar quando entrarem GHL, GA4/GTM, Turnstile, hospedagem e Sentry |
| PRV-04 | NÃO SE APLICA (ainda) | Sem leads, logs de aplicação ou analytics | Nunca colocar dados de lead em logs, Sentry ou GA4 |

### Médio

| ID | Status | Evidência | Ação |
|---|---|---|---|
| DEP-06 | VERIFICAÇÃO MANUAL | 4 dependências de produção (next, react, react-dom, @splidejs/splide) | 2FA/passkey em GitHub, npm, hospedagem, Cloudflare, registrador e GHL |
| FRM-07 | PARCIAL | Páginas de erro genéricas (abaixo) | Mensagens genéricas na fase dos formulários |
| FRM-08 | NÃO SE APLICA (ainda) | — | Caixa de consentimento de SMS desmarcada, se o GHL enviar SMS |
| ENV-05 | CUMPRIDO | `.js.map` em produção → 404 | — |
| CFG-03 | CUMPRIDO | `experimental.serverActions.bodySizeLimit: "100kb"` | — |
| CFG-04 | CUMPRIDO | Rotas: 9 páginas, robots.txt, sitemap.xml; sem `route.ts`; `redirects()` só com destinos fixos; sem i18n e sem `use cache` | Nunca expor `next dev` à internet |
| CFG-05 | CUMPRIDO | `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`: genéricas, com telefone e `error.digest` como referência, sem stack trace | — |
| INF-04 | VERIFICAÇÃO MANUAL | — | DNSSEC, CAA (+ iodef), registrar lock e renovação automática |
| PRV-02 | DECISÃO PENDENTE | — | Confirmar com o cliente se o faturamento anual passa de US$ 26.625.000 (CCPA) |
| PRV-03 | CUMPRIDO | Nenhuma página define cookie (o `seo:check` falha se alguma passar a definir); Cookies Policy escrita (estava vazia) | Banner/Consent Mode só se entrarem tags de anúncio |
| MON-01 a MON-04 | PENDENTE | — | Monitor de uptime (home e contato); Sentry com `sendDefaultPii: false` se adotado; plano de incidentes abaixo |

### Baixo

| ID | Status | Evidência |
|---|---|---|
| CFG-01 | CUMPRIDO | Sem `X-Powered-By` |
| ENV-03 | NÃO SE APLICA | Sem segredos no servidor por enquanto |
| HDR-03 | PENDENTE | Relatórios de CSP: adicionar `report-to` quando houver endpoint ou Sentry |
| PRV-05 | PARCIAL | Rótulos visíveis, foco visível, telefone como alternativa (etapa de UX); Lighthouse a medir em produção |

## Resultado dos testes (seção 11), em http://localhost

| # | Teste | Resultado |
|---|---|---|
| 1 | `npm ls next react sharp` | next 16.4.5, react 19.3.1, sharp 0.35.5 ✅ |
| 2 | `curl -sI` | CSP com nonce variável, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP; sem `X-Powered-By`; sem `Set-Cookie` ✅ |
| 3 | Navegador em todas as páginas | Sem violações de CSP; carrosséis, menu, acordeão e barra mobile funcionando ✅ |
| 4 | Site dentro de `<iframe>` | Bloqueado (`frame-ancestors 'none'` + `X-Frame-Options: DENY`) ✅ |
| 5–6 | Formulário / segredos no navegador | Formulário sem envio (fase futura); nenhum segredo no bundle ✅ |
| 7 | `/_next/image` externo; `.js.map` | 400; 404 ✅ |
| 8 | Rota inexistente; erro | 404 genérico; páginas de erro sem detalhes ✅. Métodos em APIs: não há APIs |
| 9 | Revalidação / previews | Não se aplica / hospedagem |
| 10 | E-mail e redirecionamentos http/www | `www` → domínio canônico ✅; HTTP → HTTPS e SPF/DKIM/DMARC na hospedagem/DNS |
| 11 | Link "Privacy Policy" no rodapé | Em todas as páginas ✅ |
| — | `npm audit --omit=dev` | 0 vulnerabilidades ✅ |
| — | Comparação visual com o original após o Next 16 | 250 elementos em Our Story, 0 diferenças ✅ |

## Atualizações de segurança (DEP-02)

- **Responsável:** o desenvolvedor da M&S Electric (decisão de 28/10/2026), que também cuida da hospedagem. Prazo: 24 a 72 h para avisos críticos.
- Assinar nextjs.org/blog/security e, no GitHub de `vercel/next.js`, "Watch > Custom > Security alerts".
- **Pacote de 3/11/2026: aplicado em 4/11 (16.4.5).** Para os próximos: Procedimento: `npm install next@<versão corrigida>`; `npm audit --omit=dev`; `npm run build`; rodar `npm run seo:check`; publicar; conferir `npm ls next` em produção.

## Plano de incidentes (MON-04, resumo)

1. Quem acionar: o responsável acima e o Lucas.
2. Rollback: voltar ao deploy anterior (Vercel Instant Rollback ou tag anterior).
3. Segredos (quando existirem): rotacionar o PIT do GHL (sobreposição de 7 dias), as chaves do Turnstile e recriar o Inbound Webhook se vazar.
4. Ataque: ativar o modo de ataque/WAF da borda (Cloudflare "Under Attack" ou Vercel Firewall).
5. Avisar o cliente.

## Decisões humanas pendentes

- **Hospedagem:** fica com o desenvolvedor da M&S Electric (decisão de 28/10/2026). Repassar a ele os itens INF-01 a INF-06 e a recomendação do documento (Vercel).
- **Renderização dinâmica:** com o CSP por nonce, todas as páginas são renderizadas a cada requisição (sem HTML estático nem cache de CDN). Para um site deste porte isso é aceitável, como o documento indica.
- **GoHighLevel:** domínio white-label (entra na CSP) e o que fazer com o `form_embed.js` (GHL-02).
- **CCPA (PRV-02)** e **revisão jurídica** da política de privacidade.

## Como adicionar terceiros sem quebrar o CSP

1. Inclua os domínios exatos em `src/proxy.ts` (lista no documento, itens HDR-02 e GHL-01).
2. Rode com `CSP_REPORT_ONLY=1`, percorra todas as páginas, envie o formulário e faça um agendamento: nenhuma violação no console.
3. Remova `CSP_REPORT_ONLY` e rode `npm run seo:check`.
4. Atualize a Privacy Policy e a Cookies Policy.
