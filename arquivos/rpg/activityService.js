// Serviço de Atividades do RPG (Pesca, Mineração, Coleta, Caça)
const state = require('./state');
const { ATIVIDADES, COOLDOWNS, ITEMS } = require('./constants');

function executarAtividade(userId, atividadeNome) {
    const player = state.getPlayer(userId);
    const atividade = ATIVIDADES[atividadeNome];
    
    if (!atividade) {
        return {
            success: false,
            message: '❌ Atividade não encontrada!'
        };
    }
    
    // Verifica cooldown
    const cooldownCheck = state.checkCooldown(player, atividadeNome);
    if (cooldownCheck.onCooldown) {
        const segundosRestantes = Math.ceil(cooldownCheck.remaining / 1000);
        return {
            success: false,
            message: `⏰ Aguarde ${segundosRestantes}s para ${atividade.nome.toLowerCase()} novamente!`
        };
    }
    
    // Calcula ganho base
    const [min, max] = atividade.ganho;
    let ganho = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Aplica bônus de ferramenta se tiver
    let bonusText = '';
    if (atividade.ferramenta) {
        const ferramenta = ITEMS[atividade.ferramenta];
        if (player.inventario[atividade.ferramenta]) {
            const bonus = ferramenta.bonus;
            const ganhoBonus = Math.floor(ganho * (bonus / 100));
            ganho += ganhoBonus;
            bonusText = `\n✨ Bônus ${ferramenta.nome}: +${bonus}% (+${ganhoBonus} gold)`;
        } else {
            bonusText = `\n💡 Dica: Compre ${ITEMS[atividade.ferramenta].nome} para ganhar +${ITEMS[atividade.ferramenta].bonus}%`;
        }
    }
    
    // Adiciona ganhos
    state.addGold(player, ganho);
    const xpGanho = Math.floor(ganho / 5);
    const levelUp = state.addXP(player, xpGanho);
    
    // Atualiza stats
    if (atividade.stat) {
        player.stats[atividade.stat]++;
    }
    
    // Seta cooldown
    state.setCooldown(player, atividadeNome, COOLDOWNS[atividadeNome]);
    state.saveData();
    
    let message = `${atividade.emoji} *${atividade.nome.toUpperCase()}!*\n\n`;
    message += `💰 +${ganho} gold\n`;
    message += `⭐ +${xpGanho} XP${bonusText}`;
    
    if (levelUp.leveledUp) {
        message += `\n\n🎉 *LEVEL UP!* Você subiu para o nível ${levelUp.newLevel}!`;
    }
    
    message += `\n\n💸 Gold total: ${player.gold}`;
    
    return {
        success: true,
        message
    };
}

function pescar(userId) {
    return executarAtividade(userId, 'pescar');
}

function minerar(userId) {
    return executarAtividade(userId, 'minerar');
}

function coletar(userId) {
    return executarAtividade(userId, 'coletar');
}

function cacar(userId) {
    return executarAtividade(userId, 'cacar');
}

module.exports = {
    pescar,
    minerar,
    coletar,
    cacar
};
