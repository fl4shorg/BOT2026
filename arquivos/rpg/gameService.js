// Serviço de Jogos do RPG (Tigrinho, Assalto)
const state = require('./state');
const { COOLDOWNS } = require('./constants');

function jogarTigrinho(userId, aposta) {
    const player = state.getPlayer(userId);
    
    if (isNaN(aposta) || aposta < 10) {
        return {
            success: false,
            message: '❌ Aposta inválida!\n\n💡 Aposta mínima: 10 gold\n💡 Uso: .tigrinho [valor]'
        };
    }
    
    if (player.gold < aposta) {
        return {
            success: false,
            message: `❌ Gold insuficiente!\n\n💰 Seu gold: ${player.gold}\n💸 Aposta: ${aposta}`
        };
    }
    
    // Verifica cooldown
    const cooldownCheck = state.checkCooldown(player, 'tigrinho');
    if (cooldownCheck.onCooldown) {
        const segundosRestantes = Math.ceil(cooldownCheck.remaining / 1000);
        return {
            success: false,
            message: `⏰ Aguarde ${segundosRestantes}s para jogar novamente!`
        };
    }
    
    // Símbolos do jogo
    const simbolos = ['🐅', '💎', '🍀', '🔔', '🍒', '⭐'];
    
    // Gira os slots
    const slot1 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const slot2 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const slot3 = simbolos[Math.floor(Math.random() * simbolos.length)];
    
    let ganho = 0;
    let resultado = '';
    let ganhou = false;
    
    // Jackpot - 3 diamantes
    if (slot1 === '💎' && slot2 === '💎' && slot3 === '💎') {
        ganho = aposta * 10;
        resultado = '💎💎💎 JACKPOT!!! 💎💎💎';
        ganhou = true;
    }
    // Tigrinho - 3 tigres
    else if (slot1 === '🐅' && slot2 === '🐅' && slot3 === '🐅') {
        ganho = aposta * 5;
        resultado = '🐅🐅🐅 TIGRINHO!!! 🐅🐅🐅';
        ganhou = true;
    }
    // 3 iguais
    else if (slot1 === slot2 && slot2 === slot3) {
        ganho = aposta * 3;
        resultado = `${slot1}${slot2}${slot3} Três iguais!`;
        ganhou = true;
    }
    // 2 iguais
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        ganho = aposta * 1.5;
        resultado = `${slot1}${slot2}${slot3} Dois iguais!`;
        ganhou = true;
    }
    // Perdeu
    else {
        ganho = 0;
        resultado = `${slot1}${slot2}${slot3} Não foi dessa vez!`;
        ganhou = false;
    }
    
    // Atualiza saldo
    if (ganhou) {
        player.gold -= aposta;
        state.addGold(player, ganho);
    } else {
        player.gold -= aposta;
        player.stats.totalGasto += aposta;
    }
    
    state.setCooldown(player, 'tigrinho', COOLDOWNS.tigrinho);
    state.saveData();
    
    let message = `🎰 *JOGO DO TIGRINHO* 🐅\n\n`;
    message += `${resultado}\n\n`;
    message += `💰 Aposta: ${aposta} gold\n`;
    
    if (ganhou) {
        message += `🎉 Ganhou: ${ganho} gold\n`;
        message += `💸 Lucro: +${ganho - aposta} gold\n`;
    } else {
        message += `😢 Perdeu: ${aposta} gold\n`;
    }
    
    message += `\n💰 Gold total: ${player.gold}`;
    
    return {
        success: true,
        message,
        ganhou
    };
}

function assaltar(userId, targetUserId) {
    const player = state.getPlayer(userId);
    const target = state.getPlayer(targetUserId);
    
    // Verifica se está tentando assaltar a si mesmo
    if (userId === targetUserId) {
        return {
            success: false,
            message: '❌ Você não pode assaltar a si mesmo!'
        };
    }
    
    // Verifica cooldown
    const cooldownCheck = state.checkCooldown(player, 'assaltar');
    if (cooldownCheck.onCooldown) {
        const minutosRestantes = Math.ceil(cooldownCheck.remaining / 1000 / 60);
        return {
            success: false,
            message: `⏰ Aguarde ${minutosRestantes} minutos para assaltar novamente!`
        };
    }
    
    // Verifica se a vítima tem gold
    if (target.gold < 100) {
        return {
            success: false,
            message: '❌ A vítima não tem gold suficiente para ser assaltada!\n\n💡 Mínimo: 100 gold'
        };
    }
    
    // Calcula chance de sucesso (50% base)
    let chanceBase = 50;
    
    // Bônus por nível
    const diferencaNivel = player.nivel - target.nivel;
    chanceBase += (diferencaNivel * 5);
    
    // Proteção de animais
    if (target.inventario.cachorro) {
        chanceBase -= 30;
    }
    if (target.inventario.dragao) {
        chanceBase -= 50;
    }
    
    // Limita entre 10% e 90%
    chanceBase = Math.max(10, Math.min(90, chanceBase));
    
    const sucesso = Math.random() * 100 < chanceBase;
    
    let message = '🏴‍☠️ *ASSALTO!*\n\n';
    
    if (sucesso) {
        // Rouba entre 10% e 30% do gold da vítima
        const percentual = 10 + Math.random() * 20;
        const roubado = Math.floor(target.gold * (percentual / 100));
        
        target.gold -= roubado;
        state.addGold(player, roubado);
        
        message += `✅ *SUCESSO!*\n\n`;
        message += `💰 Você roubou: ${roubado} gold (${Math.floor(percentual)}%)\n`;
        message += `💸 Seu gold: ${player.gold}\n\n`;
        message += `📊 Chance de sucesso: ${Math.floor(chanceBase)}%`;
    } else {
        // Penalidade por falhar
        const multa = 200;
        if (player.gold >= multa) {
            player.gold -= multa;
            player.stats.totalGasto += multa;
            message += `❌ *FALHOU!*\n\n`;
            message += `🚓 Você foi pego e pagou ${multa} gold de multa!\n`;
            message += `💸 Gold restante: ${player.gold}\n\n`;
        } else {
            message += `❌ *FALHOU!*\n\n`;
            message += `🚓 Você foi pego mas não tinha gold para multa!\n\n`;
        }
        message += `📊 Chance de sucesso: ${Math.floor(chanceBase)}%`;
    }
    
    state.setCooldown(player, 'assaltar', COOLDOWNS.assaltar);
    state.saveData();
    
    return {
        success: true,
        message,
        sucesso
    };
}

module.exports = {
    jogarTigrinho,
    assaltar
};
