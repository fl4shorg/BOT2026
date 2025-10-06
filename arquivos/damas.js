const axios = require('axios');

const partidasAtivas = new Map();

const PECA_BRANCA = 'B';
const PECA_PRETA = 'P';
const DAMA_BRANCA = 'DB';
const DAMA_PRETA = 'DP';
const VAZIO = null;

function criarTabuleiro() {
    const tabuleiro = Array(8).fill(null).map(() => Array(8).fill(VAZIO));
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                tabuleiro[row][col] = PECA_PRETA;
            }
        }
    }
    
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                tabuleiro[row][col] = PECA_BRANCA;
            }
        }
    }
    
    return tabuleiro;
}

async function iniciarPartida(chatId, jogador1, jogador2) {
    if (partidasAtivas.has(chatId)) {
        return {
            sucesso: false,
            mensagem: "⚠️ Já existe uma partida ativa neste chat!\n\n💡 Use `.damasparar` para encerrar a partida atual."
        };
    }
    
    const tabuleiro = criarTabuleiro();
    
    const partida = {
        tabuleiro,
        jogadorBranco: jogador1,
        jogadorPreto: jogador2,
        vezDe: jogador1,
        turno: 'branco',
        movimentos: 0,
        iniciado: Date.now(),
        ultimoMovimento: null
    };
    
    partidasAtivas.set(chatId, partida);
    
    const jogador1Nome = jogador1.split('@')[0];
    const jogador2Nome = jogador2.split('@')[0];
    
    return {
        sucesso: true,
        mensagem: `🎲 *JOGO DE DAMAS INICIADO!*

♟️ *Jogadores:*
⚪ Brancas: @${jogador1Nome}
⚫ Pretas: @${jogador2Nome}

🎯 *Vez de:* @${jogador1Nome} (⚪ Brancas)

📍 *Como jogar:*
Use: \`.damasjogada origem destino\`
Exemplo: \`.damasjogada c3 d4\`

📋 *Comandos:*
• \`.damastabuleiro\` - Ver tabuleiro
• \`.damasparar\` - Encerrar partida
• \`.damasajuda\` - Ver regras

🎮 *Boa sorte!*`,
        mentions: [jogador1, jogador2],
        imagem: await gerarImagemTabuleiro(tabuleiro, 'branco')
    };
}

async function fazerJogada(chatId, jogadorId, origem, destino) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return {
            sucesso: false,
            mensagem: "⚠️ Não há partida ativa neste chat!\n\n💡 Use `.damas @oponente` para iniciar uma partida."
        };
    }
    
    if (partida.vezDe !== jogadorId) {
        const vezDeNome = partida.vezDe.split('@')[0];
        return {
            sucesso: false,
            mensagem: `⚠️ Não é sua vez!\n\n🎯 Aguarde @${vezDeNome} jogar.`,
            mentions: [partida.vezDe]
        };
    }
    
    const origemPos = coordenadaParaPosicao(origem);
    const destinoPos = coordenadaParaPosicao(destino);
    
    if (!origemPos || !destinoPos) {
        return {
            sucesso: false,
            mensagem: "❌ Coordenadas inválidas!\n\n📍 Use formato: a1-h8\nExemplo: `.damasjogada c3 d4`"
        };
    }
    
    const validacao = validarMovimento(partida, origemPos, destinoPos, jogadorId);
    
    if (!validacao.valido) {
        return {
            sucesso: false,
            mensagem: `❌ ${validacao.mensagem}`
        };
    }
    
    executarMovimento(partida, origemPos, destinoPos, validacao);
    
    verificarVitoria(partida);
    
    if (partida.vencedor) {
        const vencedorNome = partida.vencedor.split('@')[0];
        const perdedorNome = (partida.vencedor === partida.jogadorBranco ? partida.jogadorPreto : partida.jogadorBranco).split('@')[0];
        
        const mensagem = `🏆 *VITÓRIA!*

👑 @${vencedorNome} venceu a partida!

📊 *Estatísticas:*
⏱️ Duração: ${Math.floor((Date.now() - partida.iniciado) / 1000)}s
🎯 Movimentos: ${partida.movimentos}

🎮 Use \`.damas @oponente\` para jogar novamente!`;
        
        partidasAtivas.delete(chatId);
        
        return {
            sucesso: true,
            mensagem,
            mentions: [partida.vencedor],
            imagem: await gerarImagemTabuleiro(partida.tabuleiro, partida.turno)
        };
    }
    
    const proximoJogador = partida.vezDe === partida.jogadorBranco ? partida.jogadorPreto : partida.jogadorBranco;
    partida.vezDe = proximoJogador;
    partida.turno = partida.turno === 'branco' ? 'preto' : 'branco';
    partida.movimentos++;
    
    const jogadorNome = proximoJogador.split('@')[0];
    const movimentoTexto = validacao.captura ? `${origem} captura ${destino}` : `${origem} → ${destino}`;
    
    return {
        sucesso: true,
        mensagem: `${validacao.captura ? '🎯 CAPTURA!' : '✅ Movimento realizado!'}

📍 ${movimentoTexto}
${validacao.coroou ? '👑 PEÇA COROADA!' : ''}

🎯 *Vez de:* @${jogadorNome} (${partida.turno === 'branco' ? '⚪ Brancas' : '⚫ Pretas'})

📊 Movimento ${partida.movimentos}`,
        mentions: [proximoJogador],
        imagem: gerarImagemTabuleiro(partida.tabuleiro, partida.turno)
    };
}

function coordenadaParaPosicao(coord) {
    if (!coord || coord.length !== 2) return null;
    
    const coluna = coord[0].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
    const linha = 8 - parseInt(coord[1]);
    
    if (coluna < 0 || coluna > 7 || linha < 0 || linha > 7 || isNaN(linha)) {
        return null;
    }
    
    return { linha, coluna };
}

function posicaoParaCoordenada(linha, coluna) {
    return String.fromCharCode('a'.charCodeAt(0) + coluna) + (8 - linha);
}

function validarMovimento(partida, origem, destino, jogadorId) {
    const peca = partida.tabuleiro[origem.linha][origem.coluna];
    
    if (!peca) {
        return { valido: false, mensagem: "Não há peça na posição de origem!" };
    }
    
    const ehBranco = jogadorId === partida.jogadorBranco;
    const pecasDoJogador = ehBranco ? [PECA_BRANCA, DAMA_BRANCA] : [PECA_PRETA, DAMA_PRETA];
    
    if (!pecasDoJogador.includes(peca)) {
        return { valido: false, mensagem: "Essa peça não é sua!" };
    }
    
    if (partida.tabuleiro[destino.linha][destino.coluna] !== VAZIO) {
        return { valido: false, mensagem: "A posição de destino já está ocupada!" };
    }
    
    if ((origem.linha + origem.coluna) % 2 === 0 || (destino.linha + destino.coluna) % 2 === 0) {
        return { valido: false, mensagem: "Só é possível mover para casas escuras!" };
    }
    
    const deltaLinha = destino.linha - origem.linha;
    const deltaColuna = destino.coluna - origem.coluna;
    
    const ehDama = peca === DAMA_BRANCA || peca === DAMA_PRETA;
    
    const capturasDisponiveis = verificarCapturasDisponiveis(partida, jogadorId);
    
    if (Math.abs(deltaLinha) === 1 && Math.abs(deltaColuna) === 1) {
        if (capturasDisponiveis.length > 0) {
            return { valido: false, mensagem: "Captura obrigatória! Você deve capturar uma peça adversária." };
        }
        
        if (!ehDama) {
            if (ehBranco && deltaLinha > 0) {
                return { valido: false, mensagem: "Peças brancas só movem para cima!" };
            }
            if (!ehBranco && deltaLinha < 0) {
                return { valido: false, mensagem: "Peças pretas só movem para baixo!" };
            }
        }
        
        return { valido: true, captura: false };
    }
    
    if (Math.abs(deltaLinha) === 2 && Math.abs(deltaColuna) === 2) {
        const linhaCaptura = origem.linha + deltaLinha / 2;
        const colunaCaptura = origem.coluna + deltaColuna / 2;
        const pecaCapturada = partida.tabuleiro[linhaCaptura][colunaCaptura];
        
        if (!pecaCapturada) {
            return { valido: false, mensagem: "Não há peça para capturar!" };
        }
        
        const pecasAdversarias = ehBranco ? [PECA_PRETA, DAMA_PRETA] : [PECA_BRANCA, DAMA_BRANCA];
        
        if (!pecasAdversarias.includes(pecaCapturada)) {
            return { valido: false, mensagem: "Você só pode capturar peças adversárias!" };
        }
        
        if (!ehDama) {
            if (ehBranco && deltaLinha > 0) {
                return { valido: false, mensagem: "Peças brancas só capturam para cima!" };
            }
            if (!ehBranco && deltaLinha < 0) {
                return { valido: false, mensagem: "Peças pretas só capturam para baixo!" };
            }
        }
        
        return { 
            valido: true, 
            captura: true, 
            posicaoCaptura: { linha: linhaCaptura, coluna: colunaCaptura }
        };
    }
    
    return { valido: false, mensagem: "Movimento inválido! Use movimentos diagonais de 1 casa ou capturas de 2 casas." };
}

function verificarCapturasDisponiveis(partida, jogadorId) {
    const capturas = [];
    const ehBranco = jogadorId === partida.jogadorBranco;
    const pecasDoJogador = ehBranco ? [PECA_BRANCA, DAMA_BRANCA] : [PECA_PRETA, DAMA_PRETA];
    const pecasAdversarias = ehBranco ? [PECA_PRETA, DAMA_PRETA] : [PECA_BRANCA, DAMA_BRANCA];
    
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = partida.tabuleiro[linha][coluna];
            
            if (pecasDoJogador.includes(peca)) {
                const direcoes = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
                
                for (const [dLinha, dColuna] of direcoes) {
                    const novaLinha = linha + dLinha;
                    const novaColuna = coluna + dColuna;
                    
                    if (novaLinha >= 0 && novaLinha < 8 && novaColuna >= 0 && novaColuna < 8) {
                        const linhaCaptura = linha + dLinha / 2;
                        const colunaCaptura = coluna + dColuna / 2;
                        const pecaCapturada = partida.tabuleiro[linhaCaptura][colunaCaptura];
                        
                        if (pecasAdversarias.includes(pecaCapturada) && 
                            partida.tabuleiro[novaLinha][novaColuna] === VAZIO) {
                            capturas.push({ origem: { linha, coluna }, destino: { linha: novaLinha, coluna: novaColuna } });
                        }
                    }
                }
            }
        }
    }
    
    return capturas;
}

function executarMovimento(partida, origem, destino, validacao) {
    const peca = partida.tabuleiro[origem.linha][origem.coluna];
    
    partida.tabuleiro[origem.linha][origem.coluna] = VAZIO;
    partida.tabuleiro[destino.linha][destino.coluna] = peca;
    
    if (validacao.captura && validacao.posicaoCaptura) {
        partida.tabuleiro[validacao.posicaoCaptura.linha][validacao.posicaoCaptura.coluna] = VAZIO;
    }
    
    validacao.coroou = false;
    if (peca === PECA_BRANCA && destino.linha === 0) {
        partida.tabuleiro[destino.linha][destino.coluna] = DAMA_BRANCA;
        validacao.coroou = true;
    }
    if (peca === PECA_PRETA && destino.linha === 7) {
        partida.tabuleiro[destino.linha][destino.coluna] = DAMA_PRETA;
        validacao.coroou = true;
    }
    
    partida.ultimoMovimento = { origem, destino };
}

function verificarVitoria(partida) {
    let pecasBrancas = 0;
    let pecasPretas = 0;
    
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = partida.tabuleiro[linha][coluna];
            if (peca === PECA_BRANCA || peca === DAMA_BRANCA) pecasBrancas++;
            if (peca === PECA_PRETA || peca === DAMA_PRETA) pecasPretas++;
        }
    }
    
    if (pecasPretas === 0) {
        partida.vencedor = partida.jogadorBranco;
    } else if (pecasBrancas === 0) {
        partida.vencedor = partida.jogadorPreto;
    }
}

async function mostrarTabuleiro(chatId) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return {
            sucesso: false,
            mensagem: "⚠️ Não há partida ativa neste chat!\n\n💡 Use `.damas @oponente` para iniciar uma partida."
        };
    }
    
    const jogador1Nome = partida.jogadorBranco.split('@')[0];
    const jogador2Nome = partida.jogadorPreto.split('@')[0];
    const vezDeNome = partida.vezDe.split('@')[0];
    
    let pecasBrancas = 0;
    let pecasPretas = 0;
    
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = partida.tabuleiro[linha][coluna];
            if (peca === PECA_BRANCA || peca === DAMA_BRANCA) pecasBrancas++;
            if (peca === PECA_PRETA || peca === DAMA_PRETA) pecasPretas++;
        }
    }
    
    return {
        sucesso: true,
        mensagem: `🎲 *JOGO DE DAMAS*

♟️ *Jogadores:*
⚪ Brancas: @${jogador1Nome} (${pecasBrancas} peças)
⚫ Pretas: @${jogador2Nome} (${pecasPretas} peças)

🎯 *Vez de:* @${vezDeNome} (${partida.turno === 'branco' ? '⚪ Brancas' : '⚫ Pretas'})

📊 Movimento ${partida.movimentos}
⏱️ ${Math.floor((Date.now() - partida.iniciado) / 1000)}s`,
        mentions: [partida.vezDe],
        imagem: gerarImagemTabuleiro(partida.tabuleiro, partida.turno)
    };
}

function pararPartida(chatId) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return {
            sucesso: false,
            mensagem: "⚠️ Não há partida ativa neste chat!"
        };
    }
    
    const tempo = Math.floor((Date.now() - partida.iniciado) / 1000);
    partidasAtivas.delete(chatId);
    
    return {
        sucesso: true,
        mensagem: `🛑 *Partida encerrada!*

⏱️ Duração: ${tempo}s
🎯 Movimentos: ${partida.movimentos}

🎮 Use \`.damas @oponente\` para jogar novamente!`
    };
}

function mostrarAjuda(prefix) {
    return {
        sucesso: true,
        mensagem: `🎲 *JOGO DE DAMAS - REGRAS*

📍 *Como jogar:*
• Peças movem na diagonal
• Brancas movem para cima (⚪↑)
• Pretas movem para baixo (⚫↓)
• Capturas são obrigatórias
• Ao chegar no fim, vira dama 👑
• Damas movem em qualquer direção

🎯 *Comandos:*
\`${prefix}damas @oponente\` - Iniciar partida
\`${prefix}damasjogada origem destino\` - Fazer jogada
\`${prefix}damastabuleiro\` - Ver tabuleiro
\`${prefix}damasparar\` - Encerrar partida

📋 *Exemplos de jogadas:*
\`${prefix}damasjogada c3 d4\` - Mover peça
\`${prefix}damasjogada c3 e5\` - Capturar peça

📍 *Coordenadas:*
Colunas: a-h (esquerda → direita)
Linhas: 1-8 (baixo → cima)

🏆 *Vitória:*
Capture todas as peças do adversário!`
    };
}

function gerarTabuleiroTexto(tabuleiro, ultimoMovimento = null) {
    let texto = '```\n   a  b  c  d  e  f  g  h\n';
    
    for (let linha = 0; linha < 8; linha++) {
        texto += `${8 - linha} `;
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = tabuleiro[linha][coluna];
            const casaEscura = (linha + coluna) % 2 === 1;
            
            let simbolo = ' ';
            if (casaEscura) {
                if (peca === PECA_BRANCA) simbolo = '⚪';
                else if (peca === PECA_PRETA) simbolo = '⚫';
                else if (peca === DAMA_BRANCA) simbolo = '♔';
                else if (peca === DAMA_PRETA) simbolo = '♚';
                else simbolo = '▪';
            } else {
                simbolo = '□';
            }
            
            texto += ` ${simbolo} `;
        }
        texto += `${8 - linha}\n`;
    }
    
    texto += '   a  b  c  d  e  f  g  h\n```';
    return texto;
}

async function gerarImagemTabuleiro(tabuleiro, turno) {
    try {
        const boardSize = 400;
        const squareSize = 50;
        
        let svg = `<svg width="${boardSize}" height="${boardSize + 60}" xmlns="http://www.w3.org/2000/svg">`;
        
        svg += `<rect width="${boardSize}" height="${boardSize + 60}" fill="#2c2c2c"/>`;
        
        svg += `<text x="${boardSize/2}" y="30" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">JOGO DE DAMAS</text>`;
        svg += `<text x="${boardSize/2}" y="50" font-family="Arial, sans-serif" font-size="14" fill="#FFD700" text-anchor="middle">Vez: ${turno === 'branco' ? '⚪ Brancas' : '⚫ Pretas'}</text>`;
        
        const colunas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (let i = 0; i < 8; i++) {
            svg += `<text x="${i * squareSize + squareSize/2}" y="${boardSize + 75}" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">${colunas[i]}</text>`;
            svg += `<text x="-5" y="${i * squareSize + squareSize/2 + 65}" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="end">${8-i}</text>`;
        }
        
        for (let linha = 0; linha < 8; linha++) {
            for (let coluna = 0; coluna < 8; coluna++) {
                const x = coluna * squareSize;
                const y = linha * squareSize + 60;
                const casaEscura = (linha + coluna) % 2 === 1;
                const cor = casaEscura ? '#8B4513' : '#F5DEB3';
                
                svg += `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${cor}" stroke="#000" stroke-width="1"/>`;
                
                const peca = tabuleiro[linha][coluna];
                if (peca && casaEscura) {
                    const cx = x + squareSize/2;
                    const cy = y + squareSize/2;
                    const r = 18;
                    
                    if (peca === PECA_BRANCA) {
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#333" stroke-width="2"/>`;
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r-3}" fill="none" stroke="#ccc" stroke-width="1"/>`;
                    }
                    else if (peca === PECA_PRETA) {
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1a1a" stroke="#666" stroke-width="2"/>`;
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r-3}" fill="none" stroke="#333" stroke-width="1"/>`;
                    }
                    else if (peca === DAMA_BRANCA) {
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#333" stroke-width="2"/>`;
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r-3}" fill="none" stroke="#FFD700" stroke-width="2"/>`;
                        svg += `<text x="${cx}" y="${cy+5}" font-family="Arial, sans-serif" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">♔</text>`;
                    }
                    else if (peca === DAMA_PRETA) {
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1a1a" stroke="#666" stroke-width="2"/>`;
                        svg += `<circle cx="${cx}" cy="${cy}" r="${r-3}" fill="none" stroke="#FFD700" stroke-width="2"/>`;
                        svg += `<text x="${cx}" y="${cy+5}" font-family="Arial, sans-serif" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">♚</text>`;
                    }
                }
            }
        }
        
        svg += '</svg>';
        
        const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
        const url = `https://quickchart.io/chart?bkg=white&c=${encodedSvg}`;
        
        return url;
        
    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        return null;
    }
}

module.exports = {
    iniciarPartida,
    fazerJogada,
    mostrarTabuleiro,
    pararPartida,
    mostrarAjuda,
    partidasAtivas
};
