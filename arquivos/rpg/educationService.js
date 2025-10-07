// Serviço de Educação do RPG
const state = require('./state');
const { EDUCACAO } = require('./constants');

function estudar(userId) {
    const player = state.getPlayer(userId);
    const proximoNivel = player.educacao + 1;
    
    if (!EDUCACAO[proximoNivel]) {
        return {
            success: false,
            message: '🎓 Você já atingiu o nível máximo de educação!\n\n⭐ Parabéns pela dedicação aos estudos!'
        };
    }
    
    const custo = EDUCACAO[proximoNivel].custo;
    
    if (player.gold < custo) {
        return {
            success: false,
            message: `❌ Gold insuficiente para estudar!\n\n🎓 ${EDUCACAO[proximoNivel].nome}\n💰 Custo: ${custo} gold\n💸 Seu gold: ${player.gold}\n\n❌ Faltam: ${custo - player.gold} gold`
        };
    }
    
    player.gold -= custo;
    player.stats.totalGasto += custo;
    player.educacao = proximoNivel;
    state.saveData();
    
    return {
        success: true,
        message: `🎓 *EDUCAÇÃO CONCLUÍDA!*\n\n✅ Você completou: ${EDUCACAO[proximoNivel].nome}\n💸 Custo: ${custo} gold\n💰 Gold restante: ${player.gold}\n\n📈 Novos trabalhos desbloqueados!\n💡 Use .trabalhos para ver.`
    };
}

function verEducacao(userId) {
    const player = state.getPlayer(userId);
    
    let message = '🎓 *SISTEMA DE EDUCAÇÃO*\n\n';
    message += `📚 Educação atual: ${EDUCACAO[player.educacao].nome}\n\n`;
    
    message += '📊 *NÍVEIS DE EDUCAÇÃO:*\n\n';
    
    for (let nivel = 1; nivel <= 5; nivel++) {
        const edu = EDUCACAO[nivel];
        const emoji = player.educacao >= nivel ? '✅' : nivel === player.educacao + 1 ? '📌' : '🔒';
        
        message += `${emoji} ${nivel}. ${edu.nome}\n`;
        if (edu.custo > 0) {
            message += `   💰 ${edu.custo} gold\n`;
        } else {
            message += `   💰 Grátis\n`;
        }
        
        if (player.educacao === nivel) {
            message += `   ⭐ *ATUAL*\n`;
        }
        
        message += '\n';
    }
    
    if (player.educacao < 5) {
        const proximo = EDUCACAO[player.educacao + 1];
        message += `\n💡 Próximo: ${proximo.nome} (${proximo.custo} gold)`;
        message += `\n💡 Use .estudar para avançar`;
    }
    
    return {
        success: true,
        message
    };
}

module.exports = {
    estudar,
    verEducacao
};
