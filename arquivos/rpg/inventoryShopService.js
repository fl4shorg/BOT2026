// Serviço de Loja e Inventário do RPG
const state = require('./state');
const { ITEMS } = require('./constants');

function verLoja(categoria = null) {
    if (!categoria) {
        return {
            success: true,
            message: `🏪 *LOJA RPG*\n\n📦 *CATEGORIAS:*\n\n• .loja propriedade - Casas e negócios\n• .loja veiculo - Carros e transportes\n• .loja ferramenta - Ferramentas úteis\n• .loja animal - Pets e companheiros\n\n💡 Use: .comprar [item]`
        };
    }
    
    let message = `🏪 *LOJA - ${categoria.toUpperCase()}*\n\n`;
    let count = 0;
    
    for (const [id, item] of Object.entries(ITEMS)) {
        if (item.tipo === categoria.toLowerCase()) {
            message += `${item.nome}\n`;
            message += `   💰 ${item.preco} gold\n`;
            if (item.desc) {
                message += `   📝 ${item.desc}\n`;
            }
            message += `   ID: ${id}\n\n`;
            count++;
        }
    }
    
    if (count === 0) {
        return {
            success: false,
            message: '❌ Categoria inválida!\n\n💡 Use: propriedade, veiculo, ferramenta, animal'
        };
    }
    
    message += `💡 Use: .comprar [id]`;
    
    return {
        success: true,
        message
    };
}

function comprar(userId, itemId, quantidade = 1) {
    const player = state.getPlayer(userId);
    const item = ITEMS[itemId];
    
    if (!item) {
        return {
            success: false,
            message: '❌ Item não encontrado!\n\n💡 Use .loja para ver itens disponíveis.'
        };
    }
    
    if (isNaN(quantidade) || quantidade < 1) {
        quantidade = 1;
    }
    
    const custoTotal = item.preco * quantidade;
    
    if (player.gold < custoTotal) {
        return {
            success: false,
            message: `❌ Gold insuficiente!\n\n${item.nome}\n💰 Preço unitário: ${item.preco}\n📦 Quantidade: ${quantidade}\n💸 Total: ${custoTotal} gold\n\n💰 Seu gold: ${player.gold}\n❌ Faltam: ${custoTotal - player.gold} gold`
        };
    }
    
    player.gold -= custoTotal;
    player.stats.totalGasto += custoTotal;
    player.inventario[itemId] = (player.inventario[itemId] || 0) + quantidade;
    state.saveData();
    
    return {
        success: true,
        message: `✅ *COMPRA REALIZADA!*\n\n${item.nome} x${quantidade}\n💰 Pago: ${custoTotal} gold\n💸 Gold restante: ${player.gold}\n\n📦 Total no inventário: ${player.inventario[itemId]}`
    };
}

function verInventario(userId) {
    const player = state.getPlayer(userId);
    
    if (Object.keys(player.inventario).length === 0) {
        return {
            success: true,
            message: '📦 *SEU INVENTÁRIO*\n\n❌ Vazio!\n\n💡 Use .loja para comprar itens.'
        };
    }
    
    let message = '📦 *SEU INVENTÁRIO*\n\n';
    let valorTotal = 0;
    
    for (const [itemId, qtd] of Object.entries(player.inventario)) {
        const item = ITEMS[itemId];
        if (item && qtd > 0) {
            message += `${item.nome} x${qtd}\n`;
            message += `   💰 Valor: ${item.preco * qtd} gold\n`;
            if (item.renda) {
                message += `   💸 Renda: ${item.renda * qtd} gold/dia\n`;
            }
            if (item.bonus) {
                message += `   ⚡ Bônus: +${item.bonus}%\n`;
            }
            message += '\n';
            valorTotal += item.preco * qtd;
        }
    }
    
    message += `\n💰 Valor total: ${valorTotal} gold`;
    
    return {
        success: true,
        message
    };
}

function vender(userId, itemId, quantidade = 1) {
    const player = state.getPlayer(userId);
    const item = ITEMS[itemId];
    
    if (!item) {
        return {
            success: false,
            message: '❌ Item não encontrado!'
        };
    }
    
    if (!player.inventario[itemId] || player.inventario[itemId] < quantidade) {
        return {
            success: false,
            message: `❌ Você não tem ${quantidade}x ${item.nome}!\n\n📦 No inventário: ${player.inventario[itemId] || 0}`
        };
    }
    
    // Vende por 70% do preço original
    const precoVenda = Math.floor(item.preco * 0.7);
    const ganhoTotal = precoVenda * quantidade;
    
    player.inventario[itemId] -= quantidade;
    if (player.inventario[itemId] === 0) {
        delete player.inventario[itemId];
    }
    
    state.addGold(player, ganhoTotal);
    state.saveData();
    
    return {
        success: true,
        message: `💰 *VENDA REALIZADA!*\n\n${item.nome} x${quantidade}\n💵 Recebido: ${ganhoTotal} gold (70% do valor)\n💸 Gold total: ${player.gold}`
    };
}

module.exports = {
    verLoja,
    comprar,
    verInventario,
    vender
};
