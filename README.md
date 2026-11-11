# I AM WORKER

Simulador de profissões em VR feito com **Three.js + WebXR**, pensado primeiro para o **Oculus Go**
(3DoF, um controle, Snapdragon 821 / Adreno 530), com modo de navegador para desktop.

Você é recebido pelo **Marmita** — um robô-marmita de três andares sobre uma roda, com voz em
português brasileiro — na *Agência Pega no Batente*, e trabalha em seis profissões:

| Profissão | O que você faz de verdade |
|---|---|
| Escritório | bate o ponto, faz café para o chefe (um cacto de gravata), imprime/carimba/arquiva relatórios, organiza pastas por cor, rega a planta, atende o telefone |
| Cozinha | corta legumes, cozinha e serve a sopa, frita a carne sem queimar, monta o hambúrguer na ordem, faz suco, lava a louça |
| Supermercado | repõe prateleiras, etiqueta ofertas, passa compras no leitor, dá o troco certo, seca o corredor |
| Oficina | troca pneu, troca óleo, troca bateria, pinta arranhões, lava e entrega o carro |
| Estação espacial | troca o filtro de O2, alinha painéis solares, cuida da horta, solda furos no casco, ejeta lixo — tudo em gravidade zero |
| Hotel | check-in com a chave certa, leva malas, arruma a cama, tira o pó, monta o serviço de quarto |

Cada tarefa só avança quando o estado do mundo confirma que ela foi feita (nada de botão "concluir").
Erros contam para as estrelas (1 a 3) e para o salário em moedas; o progresso fica no `localStorage`.

## Jogar

Publique a raiz do repositório no **GitHub Pages** (Settings → Pages → *Deploy from a branch* → `/ (root)`)
e abra a URL no Oculus Browser. Não há build: são módulos ES servidos direto.

Local: `python3 -m http.server 8765` e abra `http://localhost:8765` (WebXR exige HTTPS ou `localhost`).

### Controles

| | Oculus Go | Desktop |
|---|---|---|
| Andar | **segurar o gatilho** (vai para onde o controle aponta) | `W A S D` ou botão direito |
| Pegar / carregar | **clicar e segurar o touchpad** | segurar botão esquerdo (ou `E`) |
| Soltar / encaixar | **soltar o touchpad** (apontando para o anel verde) | soltar o botão |
| Usar máquinas e botões | **clique do touchpad** (ou toque curto no gatilho) | clique esquerdo |
| Usar ferramenta | segure a ferramenta e aponte para o alvo até completar | idem |
| Olhar | cabeça | mouse (clique trava o cursor) ou setas |

Mapeamento (WebXR Gamepad API, `src/core/input.js`): perfil `oculus-go` / `generic-trigger-touchpad`,
layout `xr-standard` → `buttons[0]` gatilho, `buttons[2]` touchpad. Há tratamento para o mapeamento legado
(`buttons[0]` touchpad, `buttons[1]` gatilho) e, como bônus, controles com thumbstick (grip/A/X fazem o papel
do touchpad). Nada depende de recursos exclusivos do Quest. `local-floor` é opcional: sem ele o jogo usa
`local` com altura de olhos fixa.

## Arquitetura

```
index.html, css/            página e menu 2D de entrada
lib/three.module.js         Three.js r136 (sem sintaxe moderna demais para o Chromium do Go)
src/main.js                 renderer, sessão WebXR, laço, troca de cenas com fade
src/core/build.js           geometria low-poly mesclada com cor por vértice (1 material) + painéis de texto
src/core/input.js           entrada unificada (XR gamepad / mouse+teclado)
src/core/player.js          locomoção e colisão
src/core/world.js           itens, zonas de encaixe, clicáveis, contato de ferramenta, física simples / gravidade zero
src/core/scene.js           base das cenas + motor de tarefas sequenciais (JobBase)
src/core/robot.js           o Marmita: segue o jogador, fala, reage
src/core/audio.js           efeitos sintetizados, música procedural, falas em mp3
src/scenes/hub.js           agência: tutorial e seleção de profissões
src/jobs/*.js               as seis profissões
src/data/lines.js           todas as falas (texto = legenda = roteiro da voz)
assets/voice/*.mp3          falas do Marmita
tools/gen_voice.py          regenera as falas (Piper TTS)
tools/test/                 testes automatizados
```

Otimização para o Go: sem sombras, sem pós-processamento, luz hemisférica + uma direcional, cada sala é
uma única malha estática, cada objeto é uma malha; ~30–40 draw calls e menos de 5 mil triângulos por quadro.
Picking por raio-esfera em vez de raycast em triângulos.

## Testes

```
python3 -m http.server 8765 &
cd tools/test && npm install
npm run jobs   # joga as 6 profissões do início ao fim pelo pipeline real de entrada (mira + pegar/soltar)
npm run hub    # tutorial + entrada em uma profissão
npm run xr     # sessão WebXR real com um Oculus Go emulado (IWER): gatilho anda, touchpad pega/solta/clica
```

O teste `xr` usa um emulador; ele valida o caminho WebXR e o mapeamento de botões, mas não substitui
um teste no aparelho físico (desempenho e conforto só se medem no headset).

## Créditos e licenças

Tudo aqui é original: código, modelos (gerados por código), personagens, textos e sons. O jogo é apenas
do mesmo gênero de simuladores de profissão; não usa nomes, arte, áudio ou níveis de nenhum outro jogo.

- [Three.js](https://threejs.org) r136 — licença MIT (`lib/THREE-LICENSE`).
- Voz do Marmita: sintetizada offline com [Piper](https://github.com/OHF-Voice/piper1-gpl) usando a voz
  `pt_BR-faber-medium` (dataset CC0). Os mp3 gerados estão em `assets/voice/`.
