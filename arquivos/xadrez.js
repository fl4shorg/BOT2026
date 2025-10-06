// arquivos/xadrez.js - Sistema de Xadrez para WhatsApp Bot
const { Chess } = require('chess.js');
const ChessWebAPI = require('chess-web-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const chessAPI = new ChessWebAPI();
const partidasAtivas = new Map();
const historicoPath = path.join(__dirname, '../database/xadrez_historico.json');

// Carrega histórico de partidas
function carregarHistorico() {
    try {
        if (fs.existsSync(historicoPath)) {
            return JSON.parse(fs.readFileSync(historicoPath, 'utf8'));
        }
    } catch (err) {
        console.error('Erro ao carregar histórico de xadrez:', err);
    }
    return {};
}

// Salva histórico de partidas
function salvarHistorico(historico) {
    try {
        const dir = path.dirname(historicoPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(historicoPath, JSON.stringify(historico, null, 2));
    } catch (err) {
        console.error('Erro ao salvar histórico de xadrez:', err);
    }
}

// Gera URL da imagem do tabuleiro usando ChessVision API (com coordenadas bem visíveis)
function gerarImagemTabuleiro(fen, ultimaJogada = null) {
    // Remove a parte extra do FEN (só precisamos da posição das peças + quem joga)
    const fenParts = fen.split(' ');
    const fenSimples = fenParts[0];
    const turn = fenParts[1] || 'w'; // 'w' para brancas, 'b' para pretas
    
    // Usa ChessVision FEN2Image API - gera PNG com coordenadas claras e visíveis
    let url = `https://fen2image.chessvision.ai/${encodeURIComponent(fenSimples)}?turn=${turn === 'w' ? 'white' : 'black'}`;
    
    return url;
}

// Gera descrição das coordenadas para ajudar o jogador
function gerarGuiaCoordenadas() {
    return `
📍 *COORDENADAS DO TABULEIRO:*

   a  b  c  d  e  f  g  h
8  ⬛⬜⬛⬜⬛⬜⬛⬜  8
7  ⬜⬛⬜⬛⬜⬛⬜⬛  7
6  ⬛⬜⬛⬜⬛⬜⬛⬜  6
5  ⬜⬛⬜⬛⬜⬛⬜⬛  5
4  ⬛⬜⬛⬜⬛⬜⬛⬜  4
3  ⬜⬛⬜⬛⬜⬛⬜⬛  3
2  ⬛⬜⬛⬜⬛⬜⬛⬜  2
1  ⬜⬛⬜⬛⬜⬛⬜⬛  1
   a  b  c  d  e  f  g  h

💡 Exemplo: e2e4 = peão da coluna E, linha 2 para linha 4`;
}

// Converte tabuleiro em emoji (fallback para texto se imagem falhar)
function tabuleiroPraEmoji(fen) {
    const chess = new Chess(fen);
    const board = chess.board();
    
    const pecas = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    };
    
    let texto = '```\n  a b c d e f g h\n';
    for (let i = 0; i < 8; i++) {
        texto += `${8 - i} `;
        for (let j = 0; j < 8; j++) {
            const peca = board[i][j];
            if (peca) {
                texto += pecas[peca.type.toUpperCase()] || '·';
            } else {
                texto += ((i + j) % 2 === 0) ? '□' : '■';
            }
            texto += ' ';
        }
        texto += `${8 - i}\n`;
    }
    texto += '  a b c d e f g h\n```';
    
    return texto;
}

// Inicia nova partida
function iniciarPartida(chatId, jogador1, jogador2) {
    const chess = new Chess();
    partidasAtivas.set(chatId, {
        chess: chess,
        jogador1: jogador1,
        jogador2: jogador2,
        turno: 'w',
        iniciada: new Date(),
        jogadas: []
    });
    
    return {
        sucesso: true,
        mensagem: `♟️ *PARTIDA DE XADREZ INICIADA*\n\n` +
                 `🤍 Brancas: @${jogador1.split('@')[0]}\n` +
                 `🖤 Pretas: @${jogador2.split('@')[0]}\n\n` +
                 `♟️ Vez das *BRANCAS* jogarem!\n\n` +
                 `💡 Use: \`.xadrez jogada e2e4\` para jogar`,
        mentions: [jogador1, jogador2],
        imagem: gerarImagemTabuleiro(chess.fen()),
        tabuleiroTexto: tabuleiroPraEmoji(chess.fen())
    };
}

// Faz uma jogada
function fazerJogada(chatId, jogador, movimento) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return { sucesso: false, mensagem: '❌ Não há partida em andamento neste chat!\n\n💡 Use `.xadrez @jogador1 @jogador2` para iniciar' };
    }
    
    // Verifica se é o turno do jogador
    const turnoAtual = partida.chess.turn();
    const jogadorBranca = partida.jogador1 === jogador;
    const jogadorPreta = partida.jogador2 === jogador;
    
    if ((turnoAtual === 'w' && !jogadorBranca) || (turnoAtual === 'b' && !jogadorPreta)) {
        return { 
            sucesso: false, 
            mensagem: `❌ Não é seu turno!\n\n${turnoAtual === 'w' ? '🤍 Vez das BRANCAS' : '🖤 Vez das PRETAS'}` 
        };
    }
    
    // Tenta fazer a jogada
    try {
        const jogada = partida.chess.move(movimento, { sloppy: true });
        
        if (!jogada) {
            return { 
                sucesso: false, 
                mensagem: `❌ Jogada inválida: \`${movimento}\`\n\n💡 Exemplo: \`.xadrez jogada e2e4\` ou \`.xadrez jogada Nf3\`` 
            };
        }
        
        partida.jogadas.push({
            jogador: jogador,
            jogada: jogada.san,
            tempo: new Date()
        });
        
        // Verifica fim de jogo
        let statusJogo = '';
        let fimDeJogo = false;
        
        if (partida.chess.isCheckmate()) {
            statusJogo = `\n\n🏆 *XEQUE-MATE!*\n${turnoAtual === 'w' ? '🖤 PRETAS' : '🤍 BRANCAS'} VENCERAM!`;
            fimDeJogo = true;
            registrarVitoria(chatId, partida, turnoAtual === 'w' ? partida.jogador2 : partida.jogador1);
        } else if (partida.chess.isStalemate()) {
            statusJogo = '\n\n🤝 *EMPATE POR AFOGAMENTO!*';
            fimDeJogo = true;
        } else if (partida.chess.isThreefoldRepetition()) {
            statusJogo = '\n\n🤝 *EMPATE POR REPETIÇÃO!*';
            fimDeJogo = true;
        } else if (partida.chess.isInsufficientMaterial()) {
            statusJogo = '\n\n🤝 *EMPATE POR MATERIAL INSUFICIENTE!*';
            fimDeJogo = true;
        } else if (partida.chess.isDraw()) {
            statusJogo = '\n\n🤝 *EMPATE!*';
            fimDeJogo = true;
        } else if (partida.chess.isCheck()) {
            statusJogo = '\n\n⚠️ *XEQUE!*';
        }
        
        if (fimDeJogo) {
            partidasAtivas.delete(chatId);
        }
        
        const proximoTurno = partida.chess.turn();
        
        return {
            sucesso: true,
            mensagem: `♟️ *JOGADA REALIZADA*\n\n` +
                     `${turnoAtual === 'w' ? '🤍' : '🖤'} ${jogada.san}\n\n` +
                     statusJogo +
                     (fimDeJogo ? '' : `\n\n♟️ Vez ${proximoTurno === 'w' ? 'das *BRANCAS*' : 'das *PRETAS*'} jogarem!`),
            mentions: [partida.jogador1, partida.jogador2],
            imagem: gerarImagemTabuleiro(partida.chess.fen(), jogada.from + jogada.to),
            tabuleiroTexto: tabuleiroPraEmoji(partida.chess.fen())
        };
        
    } catch (err) {
        return { 
            sucesso: false, 
            mensagem: `❌ Erro ao processar jogada: ${err.message}` 
        };
    }
}

// Mostra status da partida
function mostrarStatus(chatId) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return { sucesso: false, mensagem: '❌ Não há partida em andamento neste chat!' };
    }
    
    const turnoAtual = partida.chess.turn();
    const ultimasJogadas = partida.jogadas.slice(-5).map((j, i) => {
        const numero = partida.jogadas.length - 4 + i;
        return `${numero}. ${j.jogada}`;
    }).join('\n');
    
    const ultimaJogadaMovimento = partida.jogadas.length > 0 ? 
        partida.chess.history({ verbose: true })[partida.jogadas.length - 1] : null;
    const lastMove = ultimaJogadaMovimento ? ultimaJogadaMovimento.from + ultimaJogadaMovimento.to : null;
    
    return {
        sucesso: true,
        mensagem: `♟️ *STATUS DA PARTIDA*\n\n` +
                 `🤍 Brancas: @${partida.jogador1.split('@')[0]}\n` +
                 `🖤 Pretas: @${partida.jogador2.split('@')[0]}\n\n` +
                 `♟️ Vez ${turnoAtual === 'w' ? 'das *BRANCAS*' : 'das *PRETAS*'} jogarem!\n` +
                 `📊 Total de jogadas: ${partida.jogadas.length}\n\n` +
                 (ultimasJogadas ? `📜 Últimas jogadas:\n${ultimasJogadas}` : ''),
        mentions: [partida.jogador1, partida.jogador2],
        imagem: gerarImagemTabuleiro(partida.chess.fen(), lastMove),
        tabuleiroTexto: tabuleiroPraEmoji(partida.chess.fen())
    };
}

// Desiste da partida
function desistir(chatId, jogador) {
    const partida = partidasAtivas.get(chatId);
    
    if (!partida) {
        return { sucesso: false, mensagem: '❌ Não há partida em andamento neste chat!' };
    }
    
    const jogadorBranca = partida.jogador1 === jogador;
    const jogadorPreta = partida.jogador2 === jogador;
    
    if (!jogadorBranca && !jogadorPreta) {
        return { sucesso: false, mensagem: '❌ Você não está jogando esta partida!' };
    }
    
    const vencedor = jogadorBranca ? partida.jogador2 : partida.jogador1;
    registrarVitoria(chatId, partida, vencedor);
    partidasAtivas.delete(chatId);
    
    return {
        sucesso: true,
        mensagem: `🏳️ *DESISTÊNCIA*\n\n` +
                 `${jogadorBranca ? '🤍 Brancas' : '🖤 Pretas'} desistiram!\n\n` +
                 `🏆 Vencedor: @${vencedor.split('@')[0]}`,
        mentions: [partida.jogador1, partida.jogador2]
    };
}

// Registra vitória no histórico
function registrarVitoria(chatId, partida, vencedor) {
    try {
        const historico = carregarHistorico();
        
        if (!historico[vencedor]) {
            historico[vencedor] = { vitorias: 0, derrotas: 0, empates: 0 };
        }
        
        const perdedor = vencedor === partida.jogador1 ? partida.jogador2 : partida.jogador1;
        
        if (!historico[perdedor]) {
            historico[perdedor] = { vitorias: 0, derrotas: 0, empates: 0 };
        }
        
        historico[vencedor].vitorias++;
        historico[perdedor].derrotas++;
        
        salvarHistorico(historico);
    } catch (err) {
        console.error('Erro ao registrar vitória:', err);
    }
}

// Mostra ranking
function mostrarRanking() {
    try {
        const historico = carregarHistorico();
        const ranking = Object.entries(historico)
            .map(([jogador, stats]) => ({
                jogador,
                vitorias: stats.vitorias,
                derrotas: stats.derrotas,
                empates: stats.empates,
                pontos: stats.vitorias * 3 + stats.empates
            }))
            .sort((a, b) => b.pontos - a.pontos)
            .slice(0, 10);
        
        if (ranking.length === 0) {
            return { sucesso: true, mensagem: '📊 *RANKING DE XADREZ*\n\nAinda não há partidas registradas!' };
        }
        
        let texto = '🏆 *RANKING DE XADREZ*\n\n';
        ranking.forEach((item, index) => {
            const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            texto += `${medalha} @${item.jogador.split('@')[0]}\n`;
            texto += `   🏆 ${item.vitorias}V | ❌ ${item.derrotas}D | 🤝 ${item.empates}E | 📊 ${item.pontos}pts\n\n`;
        });
        
        return {
            sucesso: true,
            mensagem: texto,
            mentions: ranking.map(r => r.jogador)
        };
        
    } catch (err) {
        console.error('Erro ao mostrar ranking:', err);
        return { sucesso: false, mensagem: '❌ Erro ao carregar ranking!' };
    }
}

// Busca jogador no Chess.com
async function buscarJogadorChessCom(username) {
    try {
        const player = await chessAPI.getPlayer(username);
        const stats = await chessAPI.getPlayerStats(username);
        
        let texto = `♟️ *PERFIL CHESS.COM*\n\n`;
        texto += `👤 *Usuário:* ${player.body.username}\n`;
        texto += `🆔 *ID:* ${player.body.player_id}\n`;
        texto += `🌐 *URL:* ${player.body.url}\n`;
        texto += `📅 *Desde:* ${new Date(player.body.joined * 1000).toLocaleDateString()}\n`;
        
        if (stats.body.chess_rapid) {
            texto += `\n⚡ *Rápido:*\n`;
            texto += `   Rating: ${stats.body.chess_rapid.last.rating}\n`;
            texto += `   Vitórias: ${stats.body.chess_rapid.record.win}\n`;
            texto += `   Derrotas: ${stats.body.chess_rapid.record.loss}\n`;
            texto += `   Empates: ${stats.body.chess_rapid.record.draw}\n`;
        }
        
        if (stats.body.chess_blitz) {
            texto += `\n⚡ *Blitz:*\n`;
            texto += `   Rating: ${stats.body.chess_blitz.last.rating}\n`;
            texto += `   Vitórias: ${stats.body.chess_blitz.record.win}\n`;
            texto += `   Derrotas: ${stats.body.chess_blitz.record.loss}\n`;
            texto += `   Empates: ${stats.body.chess_blitz.record.draw}\n`;
        }
        
        if (stats.body.chess_bullet) {
            texto += `\n⚡ *Bullet:*\n`;
            texto += `   Rating: ${stats.body.chess_bullet.last.rating}\n`;
            texto += `   Vitórias: ${stats.body.chess_bullet.record.win}\n`;
            texto += `   Derrotas: ${stats.body.chess_bullet.record.loss}\n`;
            texto += `   Empates: ${stats.body.chess_bullet.record.draw}\n`;
        }
        
        return { sucesso: true, mensagem: texto };
        
    } catch (err) {
        return { sucesso: false, mensagem: `❌ Jogador não encontrado no Chess.com!\n\n💡 Verifique se o nome está correto` };
    }
}

// Ajuda
function mostrarAjuda(prefix) {
    return {
        sucesso: true,
        mensagem: `♟️ *COMANDOS DE XADREZ*\n\n` +
                 `🆕 *Iniciar Partida:*\n` +
                 `${prefix}xadrez @oponente\n` +
                 `(Você jogará com as brancas)\n\n` +
                 `♟️ *Fazer Jogada:*\n` +
                 `${prefix}xadrez jogada e2e4\n` +
                 `${prefix}xadrez jogada Nf3\n\n` +
                 `📊 *Ver Tabuleiro:*\n` +
                 `${prefix}xadrez status\n\n` +
                 `📍 *Ver Coordenadas:*\n` +
                 `${prefix}xadrez coordenadas\n\n` +
                 `🏳️ *Desistir:*\n` +
                 `${prefix}xadrez desistir\n\n` +
                 `🏆 *Ranking:*\n` +
                 `${prefix}xadrez ranking\n\n` +
                 `🌐 *Chess.com:*\n` +
                 `${prefix}xadrez player [username]\n\n` +
                 `💡 *Exemplos de jogadas:*\n` +
                 `• e2e4 (peão da coluna E, linha 2 para linha 4)\n` +
                 `• Nf3 (cavalo para f3)\n` +
                 `• Bb5 (bispo para b5)\n` +
                 `• O-O (roque pequeno)\n` +
                 `• O-O-O (roque grande)\n\n` +
                 `© NEEXT LTDA`
    };
}

module.exports = {
    iniciarPartida,
    fazerJogada,
    mostrarStatus,
    desistir,
    mostrarRanking,
    buscarJogadorChessCom,
    mostrarAjuda,
    partidasAtivas,
    gerarGuiaCoordenadas
};
