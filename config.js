/* ─────────────────────────────────────────────────────────────────────────
   CONFIG · Àgò spa & bem viver
   Tudo o que muda sem mexer no resto do código fica aqui.
   ───────────────────────────────────────────────────────────────────────── */
window.CONFIG = {
  nome: "Àgò spa & bem viver",

  whatsapp: {
    numero: "5531998000434", // só dígitos: DDI + DDD + número
    mensagens: {
      agendar: "Olá! Vim pelo site do Àgò spa & bem viver e gostaria de agendar um horário.",
      valores: "Olá! Vim pelo site do Àgò e gostaria de saber os valores dos rituais.",
      empresas: "Olá! Vim pelo site do Àgò e quero levar o spa para um evento da minha empresa.",
      ritual: "Olá! Vim pelo site do Àgò e quero agendar: {ritual}.", // {ritual} vira o nome do ritual
    },
  },

  instagram: "https://www.instagram.com/ago.spa/",

  // Preços do cardápio (data-preco no HTML). false = esconde os valores e o site diz "consulte no WhatsApp".
  mostrarPrecos: false,

  // Abertura "a travessia": frames do vídeo fatiado (valores impressos pelo fatiar_frames.sh)
  frames: {
    total: 150,
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },

  intro: {
    mostrar: true,          // tela "com licença" ao abrir o site
    umaVezPorSessao: true,  // não repete ao navegar de volta na mesma aba
  },
};
