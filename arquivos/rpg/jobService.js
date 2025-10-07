// Serviço de Trabalho do RPG
const state = require('./state');
const { TRABALHOS, EDUCACAO } = require('./constants');

function escolherTrabalho(userId, trabalhoId) {
    const player = state.getPlayer(userId);
    const trabalho = TRABALHOS[trabalhoId];
    
    if (!trabalho) {
        return {
            success: false,
            message: '❌ Trabalho não encontrado!\n\n💡 Use .trabalhos para ver trabalhos disponíveis.'
        };
    }
    
    // Verifica educação mínima
    if (trabalho.educacaoMin && player.educacao < trabalho.educacaoMin) {
        const educacaoNecessaria = EDUCACAO[trabalho.educacaoMin].nome;
        const educacaoAtual = EDUCACAO[player.educacao].nome;
        return {
            success: false,
            message: `❌ Educação insuficiente!\n\n${trabalho.nome}\n🎓 Requer: ${educacaoNecessaria}\n📚 Sua educação: ${educacaoAtual}\n\n💡 Use .estudar para aumentar sua educação.`
        };
    }
    
    player.trabalho = trabalhoId;
    state.saveData();
    
    return {
        success: true,
        message: `✅ *TRABALHO ESCOLHIDO!*\n\n${trabalho.nome}\n💰 Salário: ${trabalho.salario[0]}-${trabalho.salario[1]} gold\n⏰ Cooldown: ${trabalho.cooldown / 1000}s\n\n💡 Use .trabalhar para começar!`
    };
}

function trabalhar(userId) {
    const player = state.getPlayer(userId);
    
    if (!player.trabalho) {
        return {
            success: false,
            message: '❌ Você não tem emprego!\n\n💡 Use .trabalhos para ver trabalhos disponíveis.\n💡 Use .escolhertrabalho [trabalho] para escolher.'
        };
    }
    
    const trabalho = TRABALHOS[player.trabalho];
    
    // Verifica cooldown
    const cooldownCheck = state.checkCooldown(player, 'trabalhar');
    if (cooldownCheck.onCooldown) {
        const segundosRestantes = Math.ceil(cooldownCheck.remaining / 1000);
        return {
            success: false,
            message: `⏰ Aguarde ${segundosRestantes}s para trabalhar novamente!`
        };
    }
    
    // Calcula salário
    const [min, max] = trabalho.salario;
    const ganho = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Adiciona ganhos
    state.addGold(player, ganho);
    const xpGanho = Math.floor(ganho / 10);
    const levelUp = state.addXP(player, xpGanho);
    
    // Atualiza stats
    player.stats.trabalhos++;
    
    // Seta cooldown
    state.setCooldown(player, 'trabalhar', trabalho.cooldown);
    state.saveData();
    
    let message = `${trabalho.nome}\n\n`;
    message += `💰 +${ganho} gold\n`;
    message += `⭐ +${xpGanho} XP`;
    
    if (levelUp.leveledUp) {
        message += `\n\n🎉 *LEVEL UP!* Você subiu para o nível ${levelUp.newLevel}!`;
    }
    
    message += `\n\n💸 Gold total: ${player.gold}`;
    
    return {
        success: true,
        message
    };
}

function verTrabalhos(userId) {
    const player = state.getPlayer(userId);
    const educacaoAtual = player.educacao;
    
    let message = '💼 *TRABALHOS DISPONÍVEIS*\n\n';
    
    for (const [id, trabalho] of Object.entries(TRABALHOS)) {
        const disponivel = !trabalho.educacaoMin || educacaoAtual >= trabalho.educacaoMin;
        const emoji = disponivel ? '✅' : '🔒';
        
        message += `${emoji} ${trabalho.nome}\n`;
        message += `   💰 ${trabalho.salario[0]}-${trabalho.salario[1]} gold\n`;
        message += `   ⏰ ${trabalho.cooldown / 1000}s cooldown\n`;
        
        if (trabalho.educacaoMin) {
            message += `   🎓 ${EDUCACAO[trabalho.educacaoMin].nome}\n`;
        }
        
        message += `   ID: ${id}\n`;
        
        if (player.trabalho === id) {
            message += `   ⭐ *TRABALHO ATUAL*\n`;
        }
        
        message += '\n';
    }
    
    message += `\n💡 Use: .escolhertrabalho [id]`;
    
    return {
        success: true,
        message
    };
}

module.exports = {
    escolherTrabalho,
    trabalhar,
    verTrabalhos
};
