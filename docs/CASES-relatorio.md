# Estudos de caso — M&S Electric

Aplicação da pesquisa "Estudos de caso da M&S Electric: pesquisa de concorrentes e estrutura recomendada",
usando os textos aprovados da Breandan (`docs/cases-originais.md`). Data: 28/10/2026.

## Páginas criadas

| URL | O que é |
|---|---|
| `/case-studies/` | Página central (hub) |
| `/case-studies/kmg-hotels-hotel-development/` | KMG Hotels (texto aprovado em 12/10/2026) |
| `/case-studies/construction-brokers-elevator-electrical/` | Construction Brokers Inc. (texto de 20/10, com as mudanças de 22/10) |

Para adicionar um caso: incluir um objeto em `src/lib/case-studies.ts` (o hub, o modelo, o schema e os
relacionados se atualizam sozinhos), a entrada em `src/lib/seo.ts` (título 50–60, descrição 140–155,
`SITEMAP_ROUTES`) e o breadcrumb em `src/lib/breadcrumbs.ts`. Depois, rodar `npm run seo:check`.

## O que segue a pesquisa

**Página central:**
- H1 com promessa ("Commercial electrical work Kansas City builders trust") e dois botões: "Invite us to bid" (construtoras) e "Request service" (telefone, para facilities).
- Faixa de provas só com fatos confirmados: desde 2011, STEP Platinum 2026, licença Class I #954634, emergência 24/7.
- Caso em destaque (KMG), com a frase de resultado e a citação.
- Cartões com o **cliente antes da M&S** (regra da Breandan), etiquetas de mercado e serviço e uma frase de resultado.
- Depoimentos com nome, cargo e empresa.
- Bloco "Why general contractors prequalify M&S", com botão para pedir o pacote de pré-qualificação (por e-mail).
- Chamada final com cartão de contato.

**Página individual:**
- Breadcrumb Home > Case Studies > Cliente.
- Topo com o cliente primeiro ("KMG Hotels × M&S Electric") e um botão discreto "Invite us to bid".
- Ficha "At a glance": fixa ao lado no desktop, antes do texto no celular.
- Números em destaque.
- Desafio, abordagem e resultados, com o texto aprovado sem reescrever.
- Citação, equipe com foto, chamada contextual ("Planning a hotel project? Invite M&S Electric to bid."), mais casos, links para serviços e setores, datas de publicação e atualização.

**SEO:**
- Título e descrição próprios em cada página.
- `Article` em cada caso, `CollectionPage` + `ItemList` no hub e `BreadcrumbList` igual à trilha visível.
- Sem `Review`: depoimentos não são marcados como avaliação.
- Sitemap e llms.txt atualizados.

**Links internos (ida e volta):**
- "Case Studies" no menu do cabeçalho, no menu mobile e no rodapé.
- No card "Hotels" da página Markets e no card "Specialty Services" da página Services, o link "Case study: …".

**Não implementado, de propósito (a própria pesquisa recomenda esperar):**
- **Filtros por mercado e serviço:** com 2 casos, filtros que retornam quase nada passam imagem de portfólio fraco. Ativar com cerca de 6 casos.
- **Subpáginas por mercado** (`/case-studies/hospitality/`…): mesma razão.
- **Faixa de logos de clientes e construtoras:** aguardando os logos e a autorização (o Breandan vai enviar).

## Fotos da KMG Hotels (recebidas em 28/10/2026)

As 6 fotos vieram como SVG de 10 a 22 MB cada, cada um com um JPEG de 4096×2734 embutido. As fotos foram
extraídas e convertidas para WebP em 768, 1280 e 2048 px (de 25 a 370 KB), em `public/images/case-studies/kmg-hotels/`:

| Arquivo | Conteúdo (alt) | Uso |
|---|---|---|
| `mcian-exterior-night` | Aloft Hotels: letreiro e marquise iluminada à noite | **Capa** do caso, destaque e card do hub, imagem de compartilhamento (`-share.jpg`, 1200×630) e `image` do schema |
| `mkcargi-exterior-night` | Hilton Garden Inn: fachada e porte-cochère | Galeria |
| `mcien-exterior-night` | Element by Westin: fachada ao entardecer | Galeria |
| `mkcargi-front-desk` | Hilton Garden Inn: recepção e loja | Galeria |
| `mcian-conference-room` | Aloft: sala de convenções com iluminação em sanca de LED | Galeria |
| `holiday-inn-express-breakfast-area` | Holiday Inn Express: área de café da manhã | Galeria |

As legendas citam só a bandeira e o ambiente; não citam cidade nem escopo elétrico, porque esses dados não foram informados.
A galeria abre cada foto em tamanho maior (2048 px).

## Ajustes no texto aprovado

- **CBI:** aplicadas as mudanças pedidas pela Breandan em 22/10 (a menção à FSG e o item "Where it began" saíram). Em 28/10, a pedido do Jonas, saíram também as menções à fundação em 2014, que conflitavam com a fundação em 2011: o item "2014: Founded M&S Electric with CBI as a cornerstone client…" e o trecho "the account that started M&S Electric in 2014" do Quick Facts. Fica só que a parceria começou em 2012.
- **"M & S Electric" → "M&S Electric":** padronização do nome da entidade (guia de SEO 5.2.5).
- **Título da CBI:** o documento traz "Case Study: M&S Electric × Construction Brokers Inc.". Seguindo a regra de começar pelo cliente, o topo ficou "Construction Brokers Inc. × M&S Electric". O subtítulo do documento ("The relationship that started M&S Electric") também dizia que a CBI deu origem à empresa; por isso o H1 virou "Since 2012: More Than a Decade of Working Side by Side", que usa frases do próprio texto ("Since 2012", "More than a decade of working side by side"). **Avisar a Breandan dessas mudanças.**
- **E-mail do rodapé do documento:** service@ → services@ (e-mail oficial confirmado).

## Pendências

1. **Avisar a Breandan** das mudanças no texto da CBI: saíram as menções a 2014 e o título mudou (ver "Ajustes no texto aprovado").
2. **Fotos da CBI:** o caso da CBI ainda não tem fotos. A da casa de máquinas de elevador do site não foi usada, porque não está confirmado que é obra da CBI. Pedir de 6 a 12 fotos com autorização.
3. **Contato da chamada "Invite us to bid":** o cartão mostra o Ben Ryan (Owner and Director of Estimating) com o telefone e o e-mail gerais. Confirmar se é ele e se há linha direta.
4. **Pacote de pré-qualificação:** o botão pede o pacote por e-mail. Para virar download, a empresa precisa montar o PDF (W-9, certificado de seguro, carta de EMR e licenças).
5. **Mais casos:** a meta da pesquisa é de 6 a 8 no lançamento. Candidatos citados: Level Builders (Hilton Garden Inn, 54th Street) com a equipe de campo (Jay e Shane) e um caso de serviço ou retrofit LED.
6. **Números de projeto** (metragem, prazo, unidades, horas sem acidente): não existem nos textos atuais. Coletar no encerramento das obras (etapa "Case study candidate" no HighLevel).
7. **Formulário "Invite us to bid":** hoje os botões levam ao /contact/. Na fase dos formulários, criar o formulário curto (nome, empresa, tipo de projeto, data da proposta, link dos documentos) ligado ao pipeline de Bidding do HighLevel.
