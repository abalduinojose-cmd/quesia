# Quesia Constâncio Advocacia · site v3 "Vitrine Cinematográfica"

Site institucional de página única (Astro 5 estático + Tailwind CSS v4 + Lenis),
no padrão dos melhores projetos da casa: hero 100dvh full-bleed (foto do ensaio
no desktop, vídeo 9:16 em tela cheia no mobile, rodando SEMPRE com botão de
pausa), navbar transparente que vira sólida ao rolar, cartões rounded-3xl com
gradiente sutil e hover com halo dourado, numeração gigante apagada nas seções,
dourado em gradiente nos displays (Fraunces + Inter), FAB de WhatsApp em pílula
expansível. Tokens: bone `#FAF9F9` · ink `#242424` · gold `#C9A851`
(claro `#E3C883`, profundo `#8A6E2B`). Spec em
`design/specs/2026-08-01-site-design.md` (NUNCA guardar specs em docs/, o build
limpa a pasta).

Importante: mídia de fundo (vídeos do hero e do Sobre) NÃO é gateada por
prefers-reduced-motion; máquinas com animações do SO desativadas veem os vídeos
normalmente e a WCAG 2.2.2 é atendida pelos botões de pausa. Só animações de
entrada respeitam reduced-motion.

## Comandos

```bash
npm install          # dependências
npm run assets       # fontes + logo + foto do sobre + vídeo + og (roda tudo)
npm run dev          # desenvolvimento na porta 5206
npm run build        # build estático para docs/
npm run check        # type-check (astro check)
```

Scripts de asset individuais: `npm run fonts | logo | fotos | video | og`.
Os originais ficam copiados em `src-assets/` (logo do cartão, foto do ensaio,
vídeo bruto do Downloads).

## Deploy no GitHub Pages

O build sai em `docs/` (padrão dos outros projetos). Para repositório
`usuario.github.io/quesia-constancio`:

```powershell
$env:SITE_URL = 'https://SEUUSUARIO.github.io'
$env:BASE_PATH = '/quesia-constancio'
npm run build
```

Depois: commit de `docs/` e, nas configurações do repositório, Pages →
branch main → pasta `/docs`. Os assets saem na pasta `assets/` (sem underscore,
o Jekyll do Pages ignoraria `_astro/`). Para domínio próprio na raiz, rode o
build sem as duas variáveis e ajuste o `Sitemap:` em `public/robots.txt`.

## Checklist antes de publicar

- [ ] **OAB/RJ 237.540**: confirmar com a advogada (fonte: Previdenciarista).
- [ ] **Endereço**: o site usa o do cartão de visitas, Rua Vereador Carlos
      Canedo 161, Pedro do Rio. O perfil do Google mostra OUTRO endereço
      (Estr. União e Indústria 19328, CEP 25750-222). Confirmar qual vale e,
      se preciso, corrigir o perfil do Google.
- [ ] **E-mail profissional**: não localizado; `site.email` está `null`
      (o bloco só aparece quando preenchido).
- [ ] **Formação**: bacharelado e pós marcados com * "a confirmar" em
      `src/content/data.ts` (`formacao`).
- [ ] **Facebook**: o site usa o link enviado no briefing
      (`profile.php?id=100090977194195`); o painel do Google aponta para um
      perfil diferente (`id=100074628966931`). Conferir qual é o atual.
- [ ] **Horário de funcionamento**: omitido de propósito (o do Google, ter/qui
      14h-18h, parece incompleto). Se quiser exibir, adicionar em Contato.
- [ ] **Foto do Sobre**: usando `FOTOS/IMG_6381.jpg` do ensaio (mesa com
      livros). Para trocar, mude `ORIGEM_FOTO` em `scripts/fotos.mjs` e rode
      `npm run fotos`.
- [ ] **Resend**: envio por e-mail fica como TODO comentado em
      `src/components/agendamento/PreAgendamento.tsx`; hoje tudo sai via wa.me.

## Avaliações do Google (Provimento 205/2021)

O Provimento 205/2021 da OAB veda depoimentos de clientes na publicidade da
advocacia. Por isso o site exibe apenas o selo objetivo (5,0 · 46 avaliações,
com link para o perfil), e a seção completa fica pronta porém desligada.

- Para ligar (decisão da advogada): `avaliacoes.exibir = true` em
  `src/content/data.ts`. O sumário renumera sozinho.
- Há **8 avaliações reais** coletadas do perfil público em 01/08/2026 (textos
  levemente normalizados em ortografia; originais no link do perfil). Avatares
  saem como inicial em círculo dourado (`foto: null`).
- Para chegar às 12 com fotos: as 38 restantes exigem paginação no Google
  Maps com o navegador visível (a sessão autônoma teve o download de fotos de
  avaliadores bloqueado pelas regras de privacidade). Com o preview aberto,
  peça ao Claude para completar, ou salve manualmente as fotos em
  `public/avaliacoes/NN.jpg` e preencha `foto: '/avaliacoes/NN.jpg'`.

## Estrutura

```
src/
├── content/data.ts        ← TODO o texto do site, tipado (nada hardcoded)
├── layouts/BaseLayout.astro  (SEO, OG, JSON-LD Attorney, fontes, Lenis, reveals)
├── styles/global.css      (@theme + material: .cartao, .btn-ouro, .texto-ouro,
│                           .numeral-fantasma, .fab-whats, véus, sistema .anima)
├── lib/  wa.ts (links WhatsApp) · schema.ts (JSON-LD) · paths.ts
└── components/
    ├── nav/Navbar.astro   (transparente → sólida; menu mobile details/summary)
    ├── capa/  Hero.astro (foto desktop + vídeo mobile, pausa WCAG) · Selo.astro
    ├── sections/  Faixa · Sobre (vídeo emoldurado) · Areas (3 cartões) ·
    │   ComoFunciona · Formacao · Avaliacoes · Faq · Contato · Rodape
    ├── ui/  TituloSecao · Fab (pílula WhatsApp) · Assinatura · Hairline
    └── agendamento/PreAgendamento.tsx  (wizard 3 passos → wa.me filtrado)
```

Única ilha React: `PreAgendamento` (client:visible). Reveals e contadores são
CSS + IntersectionObserver globais (classe `.anima`), respeitando
`prefers-reduced-motion`; a mídia de fundo roda sempre. JSON-LD sem
`aggregateRating` e sem `openingHours`, por coerência com as decisões acima.
