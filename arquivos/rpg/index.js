// Controller Principal do Sistema RPG NeextCity
const state = require('./state');
const economyService = require('./economyService');
const activityService = require('./activityService');
const jobService = require('./jobService');
const educationService = require('./educationService');
const inventoryShopService = require('./inventoryShopService');
const gameService = require('./gameService');
const { EDUCACAO } = require('./constants');

// ==================== GRUPO ====================

function ativarRPG(groupId, ativo) {
    const group = state.getGroup(groupId);
    group.rpgAtivo = ativo;
    state.saveData();
    
    return {
        sucesso: true,
        mensagem: ativo ? '✅ RPG ativado neste grupo!' : '❌ RPG desativado neste grupo!'
    };
}

function isRPGAtivo(groupId) {
    return state.isGroupActive(groupId);
}

// ==================== JOGADOR ====================

function registrar(userId, groupId) {
    const player = state.getPlayer(userId);
    const group = state.getGroup(groupId);
    
    if (!group.players.includes(userId)) {
        group.players.push(userId);
    }
    
    state.saveData();
    
    return {
        sucesso: true,
        mensagem: `✅ *REGISTRADO COM SUCESSO!*\n\n💰 Gold inicial: ${player.gold}\n📚 Educação: ${EDUCACAO[player.educacao].nome}\n⭐ Nível: ${player.nivel}\n\n📖 Use .rpg para ver o menu completo!`
    };
}

function isUsuarioRegistrado(userId) {
    return state.isPlayerRegistered(userId);
}

function getPerfil(userId) {
    const player = state.getPlayer(userId);
    const educacaoInfo = EDUCACAO[player.educacao];
    
    let inventarioTexto = '📦 *INVENTÁRIO:*\n';
    if (Object.keys(player.inventario).length === 0) {
        inventarioTexto += '   Vazio\n';
    } else {
        const { ITEMS } = require('./constants');
        for (const [itemId, qtd] of Object.entries(player.inventario)) {
            const item = ITEMS[itemId];
            if (item && qtd > 0) {
                inventarioTexto += `   ${item.nome} x${qtd}\n`;
            }
        }
    }
    
    const rendaPassiva = economyService.calcularRendaPassiva(player);
    const { TRABALHOS } = require('./constants');
    
    return {
        sucesso: true,
        mensagem: `👤 *PERFIL DO JOGADOR*\n\n💰 *ECONOMIA:*\n   Gold: ${player.gold}\n   Banco: ${player.banco}\n   Total: ${player.gold + player.banco}\n\n📊 *PROGRESSO:*\n   Nível: ${player.nivel}\n   XP: ${player.xp}/${player.nivel * 100}\n   Educação: ${educacaoInfo.nome}\n\n💼 *TRABALHO:*\n   ${player.trabalho ? TRABALHOS[player.trabalho].nome : 'Desempregado'}\n\n💸 *RENDA PASSIVA:*\n   ${rendaPassiva} gold/dia\n\n${inventarioTexto}\n\n📈 *ESTATÍSTICAS:*\n   Pescadas: ${player.stats.pescadas || 0}\n   Minerações: ${player.stats.mineracoes || 0}\n   Coletas: ${player.stats.coletas || 0}\n   Trabalhos: ${player.stats.trabalhos || 0}`
    };
}

// ==================== MENU ====================

function getMenuRPG() {
    return `🎮 *MENU RPG - NEEXTCITY*\n\n📊 *ECONOMIA:*\n• .perfil - Ver seu perfil\n• .depositar [valor] - Guardar no banco\n• .sacar [valor] - Sacar do banco\n• .daily - Coletar bônus diário\n\n💼 *TRABALHO:*\n• .trabalhos - Ver trabalhos disponíveis\n• .escolhertrabalho [id] - Escolher trabalho\n• .trabalhar - Trabalhar e ganhar gold\n\n🎓 *EDUCAÇÃO:*\n• .educacao - Ver níveis de educação\n• .estudar - Aumentar educação\n\n🎣 *ATIVIDADES:*\n• .pescar - Pescar peixes\n• .minerar - Minerar recursos\n• .coletar - Coletar itens\n• .cacar - Caçar animais\n\n🏪 *LOJA:*\n• .loja - Ver categorias\n• .loja [categoria] - Ver itens\n• .comprar [item] - Comprar item\n• .inventario - Ver seus itens\n• .vender [item] - Vender item\n\n🎮 *JOGOS:*\n• .tigrinho [valor] - Jogo do tigrinho\n• .assaltar @user - Assaltar jogador`;
}

// ==================== WRAPPERS ====================

function trabalhar(userId) {
    const result = jobService.trabalhar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function estudar(userId) {
    const result = educationService.estudar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function pescar(userId) {
    const result = activityService.pescar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function minerar(userId) {
    const result = activityService.minerar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function coletar(userId) {
    const result = activityService.coletar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function cacar(userId) {
    const result = activityService.cacar(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function verLoja(categoria) {
    const result = inventoryShopService.verLoja(categoria);
    return { sucesso: result.success, mensagem: result.message };
}

function comprar(userId, itemId, quantidade) {
    const result = inventoryShopService.comprar(userId, itemId, quantidade);
    return { sucesso: result.success, mensagem: result.message };
}

function verInventario(userId) {
    const result = inventoryShopService.verInventario(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function vender(userId, itemId, quantidade) {
    const result = inventoryShopService.vender(userId, itemId, quantidade);
    return { sucesso: result.success, mensagem: result.message };
}

function depositar(userId, valor) {
    const result = economyService.depositar(userId, valor);
    return { sucesso: result.success, mensagem: result.message };
}

function sacar(userId, valor) {
    const result = economyService.sacar(userId, valor);
    return { sucesso: result.success, mensagem: result.message };
}

function daily(userId) {
    const result = economyService.coletarDaily(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function jogarTigrinho(userId, aposta) {
    const result = gameService.jogarTigrinho(userId, aposta);
    return { sucesso: result.success, mensagem: result.message, ganhou: result.ganhou };
}

function assaltar(userId, targetUserId) {
    const result = gameService.assaltar(userId, targetUserId);
    return { sucesso: result.success, mensagem: result.message, sucesso_assalto: result.sucesso };
}

function verTrabalhos(userId) {
    const result = jobService.verTrabalhos(userId);
    return { sucesso: result.success, mensagem: result.message };
}

function escolherTrabalho(userId, trabalhoId) {
    const result = jobService.escolherTrabalho(userId, trabalhoId);
    return { sucesso: result.success, mensagem: result.message };
}

function verEducacao(userId) {
    const result = educationService.verEducacao(userId);
    return { sucesso: result.success, mensagem: result.message };
}

// Inicializa dados ao carregar
state.loadData().catch(console.error);

module.exports = {
    // Sistema
    ativarRPG,
    isRPGAtivo,
    getMenuRPG,
    
    // Jogador
    registrar,
    isUsuarioRegistrado,
    getPerfil,
    
    // Trabalho
    trabalhar,
    verTrabalhos,
    escolherTrabalho,
    
    // Educação
    estudar,
    verEducacao,
    
    // Atividades
    pescar,
    minerar,
    coletar,
    cacar,
    
    // Loja
    verLoja,
    comprar,
    verInventario,
    vender,
    
    // Economia
    depositar,
    sacar,
    daily,
    
    // Jogos
    jogarTigrinho,
    assaltar
};
