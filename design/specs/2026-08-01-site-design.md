# Quesia Constâncio Advocacia · Spec de design (v3 vigente)

Data: 2026-08-01 · Nota: a spec da v2 vivia em docs/specs e foi apagada pelo
próprio build (docs/ é a pasta de saída). Este arquivo, fora de docs/, registra
o essencial da v2 e a v3 aprovada.

## v3 "Vitrine Cinematográfica" (APROVADA, vigente)

Pedido do usuário: layout 100% novo no padrão dos melhores projetos do
histórico (Micheli Lima, Trato Saúde, Jessica Groomer, AGF). Motor técnico da
v2 preservado (SEO, JSON-LD Attorney, wizard wa.me, scripts de asset, build
docs/ com BASE_PATH).

- **Hero 100dvh full-bleed**: desktop com FOTO do ensaio (IMG_6381, véu escuro
  da esquerda, drift sutil só sem reduced-motion); mobile com o VÍDEO 9:16 em
  tela cheia. **Vídeo roda SEMPRE** (a máquina do usuário tem
  prefers-reduced-motion ativo; regra da casa: mídia de fundo roda sempre, com
  botão de pausa WCAG 2.2.2; só animações de entrada respeitam reduced-motion).
  Texto: eyebrow caps dourado, H1 Fraunces com "direitos" e "paixão" em
  gradiente dourado, sub com nome + OAB, CTA dourado "líquido" + outline claro.
- **Navbar** transparente sobre o hero, fundo bone SÓLIDO ao rolar (lição AGF),
  menu mobile em details/summary, botão WhatsApp compacto.
- **Faixa de prova** (ink): 4 estatísticas com régua fina e tique dourado:
  5,0★ (46 avaliações, contador animado), OAB/RJ 237.540, Pedro do Rio,
  presencial e online.
- **Sobre**: texto arejado + VÍDEO 9:16 emoldurado ao lado (rounded-3xl),
  assinatura, sempre rodando com pausa.
- **Áreas**: 3 cartões rounded-3xl `.cartao .cartao-vivo` (gradiente sutil,
  hover levanta com halo dourado), ícones stroke fino, tópicos com ponto
  dourado, CTA por área com wa.me filtrado, numeração gigante apagada atrás.
- **Como funciona**: 3 passos escalonados, numerais itálicos em gradiente.
- **Selo Google**: banda com o selo circular 5,0 · 46; a seção completa com as
  8 avaliações reais segue codada e DESLIGADA (Provimento 205/2021).
- **FAQ**: acordeões em cartões arredondados claros.
- **Contato** (ink): wizard 3 passos (botão de envio em `.btn-ouro`) +
  WhatsApp em display, endereço com link de rota, ícones de redes.
- **Rodapé escuro com ÍCONES** de redes (nunca texto) + avisos OAB +
  privacidade + crédito. **FAB do WhatsApp em pílula expansível** (hover revela
  "Conversar no WhatsApp", pulso 3 ciclos, gated por reduced-motion).
- **Tipografia**: Fraunces Variable (títulos, SOFT 60 WONK 0) + Inter (corpo).
  Gradiente dourado só em display ≥24px. Paleta bone #FAF9F9 / ink #242424 /
  gold #C9A851 (claro #E3C883, profundo #8A6E2B).
- Sem travessões no copy. Âncoras e ids preservados (sobre, areas,
  como-funciona, formacao, faq, contato).

## v2 "Dossiê" (registro histórico, substituída)

Capa tipográfica com sumário e leaders pontilhados, seções numeradas § com
"fls. NN/NN", vídeo como faixa vertical entre as linhas do nome, hairlines,
radius ≤4px. Substituída a pedido do usuário em 01/08/2026: a estética
editorial-flat não era o padrão que ele ama (mesmo padrão rejeitado na
primeira Micheli), e o vídeo gateado por reduced-motion nunca rodou na máquina
dele.
