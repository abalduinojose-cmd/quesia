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

## Deploy

Repositório: https://github.com/abalduinojose-cmd/quesia
Prévia: https://abalduinojose-cmd.github.io/quesia/

**Prévia (GitHub Pages).** O `build:pages` já aplica sozinho a base `/quesia` e
o domínio do Pages:

```bash
npm run build:pages
```

Depois `git add -A`, commit e `git push`. Nas configurações do repositório,
Pages deve estar em **branch main, pasta /docs**. O arquivo `public/.nojekyll`
é obrigatório (sem ele o Jekyll do Pages descarta pastas iniciadas por
underscore) e os assets saem em `assets/` justamente por isso.

**Domínio próprio.** Use `npm run build` (base na raiz), ajuste o domínio em
`astro.config.mjs` e o `Sitemap:` em `public/robots.txt`.

## Agenda e painel da equipe

- **Painel:** https://abalduinojose-cmd.github.io/quesia/admin
  Usuário `quesiaadv` · senha `123456` (trocar em `src/pages/admin.astro`,
  constantes `USUARIO` e `SENHA`).
- Três abas: **Próximos dias** (marcar ocupado, bloquear data), **Grade fixa**
  (horários de cada dia da semana) e **Ajustes** (antecedência e janela).
- A grade fica em `public/grade.json` e é lida **em tempo de execução**, então
  publicar horários novos NÃO exige recompilar o site.
- No painel a equipe marca os horários de cada dia da semana, bloqueia datas
  (feriado, férias), marca horários já ocupados e ajusta antecedência mínima e
  quantos dias mostrar.
- Ao clicar em **Publicar grade**, o painel baixa um `grade.json`. Envie esse
  arquivo para a pasta `docs/` do repositório (pelo site do GitHub mesmo,
  "Add file → Upload files", substituindo o antigo). Em 2 a 3 minutos o site
  mostra os horários novos.
- Enquanto não publicar, as mudanças ficam salvas só no aparelho de quem editou.

**Limite conhecido:** sem banco de dados, o site não trava o horário sozinho
quando alguém agenda. A reserva se conclui na conversa do WhatsApp e a equipe
marca o horário como ocupado no painel. Para reserva automática entre
visitantes seria necessário um backend (Supabase, por exemplo).

## Checklist antes de publicar

- [ ] **OAB/RJ 237.540**: confirmar com a advogada (fonte: Previdenciarista).
- [x] **Endereço**: confirmado pela advogada em 03/08/2026, Estrada União e
      Indústria, 19.328, sobreloja, Pedro do Rio, Petrópolis/RJ. O endereço do
      cartão de visitas (Rua Vereador Carlos Canedo, 161) está desatualizado.
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
