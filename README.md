# Àgò spa & bem viver · site

Site cinematográfico estático (HTML, CSS e JS, sem build) do **Àgò spa & bem viver**, no São Bento, em Belo Horizonte.

**Conceito:** *Àgò, com licença, você pode entrar.* Em iorubá, *àgò* é o pedido de licença para entrar num espaço. O site é a travessia da rua até a sala silenciosa: luz do dia, penumbra âmbar, silêncio lilás.

## O que tem

| Parte | Como funciona |
|---|---|
| Intro "com licença" | O símbolo se desenha em traço, a esfera cai e assenta, "Àgò" aparece letra por letra e a página abre em íris. Aparece uma vez por sessão (`CONFIG.intro`). |
| Hero 3D | `hero3d.js` (Three.js 0.160.0 via CDN): esfera berinjela pendurada por um fio balançando como pêndulo, anel e pétalas girando, chama âmbar que ilumina a esfera, fumaça e poeira de luz. O mouse inclina o pêndulo. A animação pausa fora da tela, respeita `prefers-reduced-motion` e mostra o símbolo em SVG se não houver WebGL. |
| A travessia | 150 frames (`assets/frames/`) tocados pela rolagem, com uma porta de madeira que se abre e 3 momentos de texto. |
| Rituais | Cardápio de massagens e ayurveda; cada linha abre o WhatsApp já citando o ritual. |
| O espaço | Galeria horizontal que corre com a rolagem. |
| Sua visita | Os 4 passos da visita trocam a foto ou o vídeo fixo ao lado. |
| Extras | Respiração guiada (4 · 4 · 6), som ambiente por Web Audio (desligado por padrão), cursor com halo âmbar, cards com tilt 3D, grão de filme, WhatsApp flutuante com menu. |

## Editar

Tudo o que muda sem mexer no código fica em **`config.js`**:

- `whatsapp.numero` e as mensagens de cada botão
- `mostrarPrecos`: `true` mostra os valores do cardápio (estão em `data-preco` no `index.html`)
- `intro.mostrar` / `intro.umaVezPorSessao`

Textos, avaliações e perguntas frequentes estão direto no `index.html`.

## Rodar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080   (?intro=0 pula a abertura)
```

## Publicar na Vercel

Importe o repositório em vercel.com → *Add New Project*. O projeto não tem build e o diretório de saída é a raiz. O `vercel.json` já configura o cache dos assets.

## Arquivos

```
index.html      estrutura, copy, SEO e JSON-LD (DaySpa)
estilo.css      tokens de cor/tipo, temas (noite, claro, berinjela) e componentes
app.js          intro, travessia, galeria, visita, carrossel, respiração, som, WhatsApp
hero3d.js       cena 3D do hero
config.js       configurações editáveis
assets/         logo.svg, simbolo.svg, og.jpg, img/ (fotos reais tratadas), video/, frames/
```

Fotos e vídeos são do próprio espaço. A abertura "a travessia" foi gerada a partir de uma foto real da sala de massagem (Nano Banana 2.1 + Veo 3.1 Lite, via OpenRouter).
