// Serviço de Economia do RPG
const state = require('./state');
const { ITEMS } = require('./constants');

function depositar(userId, valor) {
    const player = state.getPlayer(userId);
    
    if (isNaN(valor) || valor <= 0) {
        return {
            success: false,
            message: '❌ Valor inválido! Digite um número positivo.'
        };
    }
    
    if (player.gold < valor) {
        return {
            success: false,
            message: `❌ Gold insuficiente!\n\n💰 Seu gold: ${player.gold}\n💸 Tentou depositar: ${valor}`
        };
    }
    
    player.gold -= valor;
    player.banco += valor;
    state.saveData();
    
    return {
        success: true,
        message: `🏦 *DEPÓSITO REALIZADO!*\n\n💰 Depositado: ${valor} gold\n🏦 Saldo banco: ${player.banco} gold\n💸 Gold restante: ${player.gold} gold`
    };
}

function sacar(userId, valor) {
    const player = state.getPlayer(userId);
    
    if (isNaN(valor) || valor <= 0) {
        return {
            success: false,
            message: '❌ Valor inválido! Digite um número positivo.'
        };
    }
    
    if (player.banco < valor) {
        return {
            success: false,
            message: `❌ Saldo insuficiente no banco!\n\n🏦 Saldo banco: ${player.banco}\n💸 Tentou sacar: ${valor}`
        };
    }
    
    player.banco -= valor;
    player.gold += valor;
    state.saveData();
    
    return {
        success: true,
        message: `🏦 *SAQUE REALIZADO!*\n\n💰 Sacado: ${valor} gold\n💸 Gold atual: ${player.gold} gold\n🏦 Saldo banco: ${player.banco} gold`
    };
}

function calcularRendaPassiva(player) {
    let renda = 0;
    for (const [itemId, qtd] of Object.entries(player.inventario)) {
        const item = ITEMS[itemId];
        if (item && item.renda) {
            renda += item.renda * qtd;
        }
    }
    return renda;
}

function coletarDaily(userId) {
    const player = state.getPlayer(userId);
    const now = Date.now();
    const cooldown = 86400000; // 24 horas
    
    const lastDaily = player.cooldowns.daily || 0;
    
    if (now - lastDaily < cooldown) {
        const restante = Math.ceil((cooldown - (now - lastDaily)) / 1000 / 60 / 60);
        return {
            success: false,
            message: `⏰ Você já coletou hoje!\n\n🕐 Aguarde ${restante}h para coletar novamente.`
        };
    }
    
    // Calcula daily
    const baseDaily = 100;
    const nivelBonus = player.nivel * 10;
    const rendaPassiva = calcularRendaPassiva(player);
    const totalDaily = baseDaily + nivelBonus + rendaPassiva;
    
    state.addGold(player, totalDaily);
    player.cooldowns.daily = now;
    state.saveData();
    
    return {
        success: true,
        message: `💰 *DAILY COLETADO!*\n\n✅ +${totalDaily} gold\n\n📊 Breakdown:\n• Base: ${baseDaily}\n• Nível ${player.nivel}: +${nivelBonus}\n• Renda passiva: +${rendaPassiva}\n\n💸 Gold total: ${player.gold} gold\n\n🕐 Próximo daily: 24h`
    };
}

function transferir(fromUserId, toUserId, valor) {
    const fromPlayer = state.getPlayer(fromUserId);
    const toPlayer = state.getPlayer(toUserId);
    
    if (isNaN(valor) || valor <= 0) {
        return {
            success: false,
            message: '❌ Valor inválido!'
        };
    }
    
    if (fromPlayer.gold < valor) {
        return {
            success: false,
            message: `❌ Gold insuficiente!\n\n💰 Seu gold: ${fromPlayer.gold}`
        };
    }
    
    fromPlayer.gold -= valor;
    toPlayer.gold += valor;
    state.saveData();
    
    return {
        success: true,
        message: `💸 *TRANSFERÊNCIA REALIZADA!*\n\n💰 Enviado: ${valor} gold\n💸 Seu gold restante: ${fromPlayer.gold} gold`,
        data: { valor, fromGold: fromPlayer.gold, toGold: toPlayer.gold }
    };
}

module.exports = {
    depositar,
    sacar,
    calcularRendaPassiva,
    coletarDaily,
    transferir
};
