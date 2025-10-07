// Sistema RPG NeextCity - Versão 2.0 Reconstruída
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');

const DATA_FILE = path.join(__dirname, '../database/grupos/rpg_data.json');

// ==================== DADOS DO JOGO ====================

const ITEMS = {
    // Propriedades
    barraca: { nome: '⛺ Barraca', preco: 500, tipo: 'propriedade', renda: 10 },
    casa: { nome: '🏠 Casa', preco: 15000, tipo: 'propriedade', renda: 50 },
    mansao: { nome: '🏰 Mansão', preco: 300000, tipo: 'propriedade', renda: 500 },
    
    // Veículos
    bicicleta: { nome: '🚲 Bicicleta', preco: 800, tipo: 'veiculo', bonus: 15 },
    moto: { nome: '🏍️ Moto', preco: 15000, tipo: 'veiculo', bonus: 30 },
    carro: { nome: '🚗 Carro', preco: 40000, tipo: 'veiculo', bonus: 50 },
    ferrari: { nome: '🏁 Ferrari', preco: 1000000, tipo: 'veiculo', bonus: 100 },
    
    // Ferramentas
    vara: { nome: '🎣 Vara de Pesca', preco: 100, tipo: 'ferramenta', uso: 'pesca', bonus: 20 },
    picareta: { nome: '⛏️ Picareta', preco: 500, tipo: 'ferramenta', uso: 'mineracao', bonus: 30 },
    rifle: { nome: '🔫 Rifle', preco: 3000, tipo: 'ferramenta', uso: 'caca', bonus: 40 },
    
    // Animais
    cachorro: { nome: '🐕 Cachorro', preco: 1000, tipo: 'animal', protecao: 30 },
    cavalo: { nome: '🐴 Cavalo', preco: 8000, tipo: 'animal', velocidade: 25 },
    dragao: { nome: '🐲 Dragão', preco: 1000000, tipo: 'animal', protecao: 100 }
};

const TRABALHOS = {
    entregador: { nome: '📦 Entregador', salario: [50, 100], cooldown: 60000 },
    garcom: { nome: '🍽️ Garçom', salario: [80, 150], cooldown: 60000 },
    vendedor: { nome: '👔 Vendedor', salario: [100, 200], cooldown: 60000 },
    programador: { nome: '💻 Programador', salario: [300, 500], cooldown: 120000, educacao: 3 },
    medico: { nome: '⚕️ Médico', salario: [800, 1500], cooldown: 180000, educacao: 5 }
};

const EDUCACAO = {
    1: { nome: 'Fundamental', custo: 0 },
    2: { nome: 'Médio', custo: 1000 },
    3: { nome: 'Técnico', custo: 3000 },
    4: { nome: 'Superior', custo: 8000 },
    5: { nome: 'Pós-graduação', custo: 15000 }
};

// ==================== PERSISTÊNCIA ====================

let dataCache = null;
let saveTimeout = null;

async function loadData() {
    if (dataCache) return dataCache;
    
    try {
        const content = await fs.readFile(DATA_FILE, 'utf8');
        dataCache = JSON.parse(content);
    } catch (err) {
        dataCache = { grupos: {}, players: {} };
    }
    
    return dataCache;
}

async function saveData() {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
        try {
            await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
            await fs.writeFile(DATA_FILE, JSON.stringify(dataCache, null, 2));
        } catch (err) {
            console.error('Erro ao salvar RPG:', err);
        }
    }, 1000);
}

function getPlayer(userId) {
    const data = dataCache || { players: {} };
    if (!data.players[userId]) {
        data.players[userId] = {
            gold: 500,
            banco: 0,
            xp: 0,
            nivel: 1,
            educacao: 1,
            inventario: {},
            trabalho: null,
            lastWork: 0,
            lastFish: 0,
            lastMine: 0,
            lastCollect: 0,
            registrado: Date.now()
        };
    }
    return data.players[userId];
}

function getGrupo(groupId) {
    const data = dataCache || { grupos: {} };
    if (!data.grupos[groupId]) {
        data.grupos[groupId] = {
            rpgAtivo: false,
            players: []
        };
    }
    return data.grupos[groupId];
}

// ==================== COMANDOS ====================

function ativarRPG(groupId, ativo) {
    const grupo = getGrupo(groupId);
    grupo.rpgAtivo = ativo;
    saveData();
    return {
        sucesso: true,
        mensagem: ativo ? '✅ RPG ativado neste grupo!' : '❌ RPG desativado neste grupo!'
    };
}

function isRPGAtivo(groupId) {
    const grupo = getGrupo(groupId);
    return grupo.rpgAtivo === true;
}

function registrar(userId, groupId) {
    const player = getPlayer(userId);
    const grupo = getGrupo(groupId);
    
    if (!grupo.players.includes(userId)) {
        grupo.players.push(userId);
    }
    
    saveData();
    
    return {
        sucesso: true,
        mensagem: `✅ *REGISTRADO COM SUCESSO!*\n\n💰 Gold inicial: ${player.gold}\n📚 Educação: ${EDUCACAO[player.educacao].nome}\n\n📖 Use .rpg para ver o menu completo!`
    };
}

function isUsuarioRegistrado(userId) {
    const data = dataCache || { players: {} };
    return !!data.players[userId];
}

function getPerfil(userId) {
    const player = getPlayer(userId);
    const educacaoInfo = EDUCACAO[player.educacao];
    
    let inventarioTexto = '📦 *INVENTÁRIO:*\n';
    if (Object.keys(player.inventario).length === 0) {
        inventarioTexto += '   Vazio\n';
    } else {
        for (const [itemId, qtd] of Object.entries(player.inventario)) {
            const item = ITEMS[itemId];
            if (item) {
                inventarioTexto += `   ${item.nome} x${qtd}\n`;
            }
        }
    }
    
    const rendaPassiva = calcularRendaPassiva(player);
    
    return {
        sucesso: true,
        mensagem: `👤 *PERFIL DO JOGADOR*

💰 *ECONOMIA:*
   Gold: ${player.gold}
   Banco: ${player.banco}
   Total: ${player.gold + player.banco}

📊 *PROGRESSO:*
   Nível: ${player.nivel}
   XP: ${player.xp}
   Educação: ${educacaoInfo.nome}

💼 *TRABALHO:*
   ${player.trabalho ? TRABALHOS[player.trabalho].nome : 'Desempregado'}

💸 *RENDA PASSIVA:*
   ${rendaPassiva} gold/dia

${inventarioTexto}`
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

function trabalhar(userId) {
    const player = getPlayer(userId);
    const agora = Date.now();
    
    if (!player.trabalho) {
        return {
            sucesso: false,
            mensagem: '❌ Você não tem emprego! Use .rpg para ver trabalhos disponíveis.'
        };
    }
    
    const trabalho = TRABALHOS[player.trabalho];
    const cooldown = trabalho.cooldown || 60000;
    
    if (agora - player.lastWork < cooldown) {
        const restante = Math.ceil((cooldown - (agora - player.lastWork)) / 1000);
        return {
            sucesso: false,
            mensagem: `⏰ Aguarde ${restante}s para trabalhar novamente!`
        };
    }
    
    const [min, max] = trabalho.salario;
    const ganho = Math.floor(Math.random() * (max - min + 1)) + min;
    
    player.gold += ganho;
    player.xp += Math.floor(ganho / 10);
    player.lastWork = agora;
    
    // Level up
    const xpNecessario = player.nivel * 100;
    if (player.xp >= xpNecessario) {
        player.nivel++;
        player.xp = 0;
        saveData();
        return {
            sucesso: true,
            mensagem: `${trabalho.nome}\n\n💰 +${ganho} gold\n⭐ +${Math.floor(ganho / 10)} XP\n\n🎉 *LEVEL UP!* Você subiu para o nível ${player.nivel}!`
        };
    }
    
    saveData();
    
    return {
        sucesso: true,
        mensagem: `${trabalho.nome}\n\n💰 +${ganho} gold\n⭐ +${Math.floor(ganho / 10)} XP`
    };
}

function estudar(userId) {
    const player = getPlayer(userId);
    const proximoNivel = player.educacao + 1;
    
    if (!EDUCACAO[proximoNivel]) {
        return {
            sucesso: false,
            mensagem: '🎓 Você já atingiu o nível máximo de educação!'
        };
    }
    
    const custo = EDUCACAO[proximoNivel].custo;
    
    if (player.gold < custo) {
        return {
            sucesso: false,
            mensagem: `❌ Você precisa de ${custo} gold para estudar ${EDUCACAO[proximoNivel].nome}!\n💰 Seu gold: ${player.gold}`
        };
    }
    
    player.gold -= custo;
    player.educacao = proximoNivel;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `🎓 *EDUCAÇÃO CONCLUÍDA!*\n\nVocê completou: ${EDUCACAO[proximoNivel].nome}\n💸 Custo: ${custo} gold\n\n📈 Novos trabalhos desbloqueados!`
    };
}

function pescar(userId) {
    const player = getPlayer(userId);
    const agora = Date.now();
    
    const cooldown = 45000; // 45 segundos
    
    if (agora - player.lastFish < cooldown) {
        const restante = Math.ceil((cooldown - (agora - player.lastFish)) / 1000);
        return {
            sucesso: false,
            mensagem: `⏰ Aguarde ${restante}s para pescar novamente!`
        };
    }
    
    let bonusVara = 0;
    if (player.inventario.vara) {
        bonusVara = ITEMS.vara.bonus;
    }
    
    const baseGanho = Math.floor(Math.random() * 50) + 30;
    const ganho = Math.floor(baseGanho * (1 + bonusVara / 100));
    
    player.gold += ganho;
    player.xp += Math.floor(ganho / 5);
    player.lastFish = agora;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `🎣 *PESCARIA!*\n\nVocê pescou alguns peixes!\n💰 +${ganho} gold\n⭐ +${Math.floor(ganho / 5)} XP${bonusVara > 0 ? `\n🎋 Bônus vara: +${bonusVara}%` : ''}`
    };
}

function minerar(userId) {
    const player = getPlayer(userId);
    const agora = Date.now();
    
    const cooldown = 60000; // 1 minuto
    
    if (agora - player.lastMine < cooldown) {
        const restante = Math.ceil((cooldown - (agora - player.lastMine)) / 1000);
        return {
            sucesso: false,
            mensagem: `⏰ Aguarde ${restante}s para minerar novamente!`
        };
    }
    
    let bonusPickaxe = 0;
    if (player.inventario.picareta) {
        bonusPickaxe = ITEMS.picareta.bonus;
    }
    
    const baseGanho = Math.floor(Math.random() * 80) + 40;
    const ganho = Math.floor(baseGanho * (1 + bonusPickaxe / 100));
    
    player.gold += ganho;
    player.xp += Math.floor(ganho / 5);
    player.lastMine = agora;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `⛏️ *MINERAÇÃO!*\n\nVocé encontrou minérios!\n💰 +${ganho} gold\n⭐ +${Math.floor(ganho / 5)} XP${bonusPickaxe > 0 ? `\n⛏️ Bônus picareta: +${bonusPickaxe}%` : ''}`
    };
}

function coletar(userId) {
    const player = getPlayer(userId);
    const agora = Date.now();
    
    const cooldown = 30000; // 30 segundos
    
    if (agora - player.lastCollect < cooldown) {
        const restante = Math.ceil((cooldown - (agora - player.lastCollect)) / 1000);
        return {
            sucesso: false,
            mensagem: `⏰ Aguarde ${restante}s para coletar novamente!`
        };
    }
    
    const ganho = Math.floor(Math.random() * 30) + 20;
    
    player.gold += ganho;
    player.xp += Math.floor(ganho / 5);
    player.lastCollect = agora;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `🌿 *COLETA!*\n\nVocê coletou recursos!\n💰 +${ganho} gold\n⭐ +${Math.floor(ganho / 5)} XP`
    };
}

function verLoja(categoria = null) {
    if (!categoria) {
        return {
            sucesso: true,
            mensagem: `🏪 *LOJA RPG*

📦 *CATEGORIAS:*
• .loja propriedades - Casas e negócios
• .loja veiculos - Carros e transportes
• .loja ferramentas - Itens úteis
• .loja animais - Pets e companheiros

💡 Use: .comprar [item]`
        };
    }
    
    let mensagem = `🏪 *LOJA - ${categoria.toUpperCase()}*\n\n`;
    let count = 0;
    
    for (const [id, item] of Object.entries(ITEMS)) {
        if (item.tipo === categoria.toLowerCase() || 
            (categoria.toLowerCase() === 'propriedades' && item.tipo === 'propriedade')) {
            mensagem += `${item.nome}\n`;
            mensagem += `   💰 ${item.preco} gold\n`;
            mensagem += `   ID: ${id}\n\n`;
            count++;
        }
    }
    
    if (count === 0) {
        return {
            sucesso: false,
            mensagem: '❌ Categoria inválida! Use: propriedades, veiculos, ferramentas, animais'
        };
    }
    
    return {
        sucesso: true,
        mensagem: mensagem + `💡 Use: .comprar ${Object.keys(ITEMS).find(k => ITEMS[k].tipo === categoria.toLowerCase())}`
    };
}

function comprar(userId, itemId) {
    const player = getPlayer(userId);
    const item = ITEMS[itemId];
    
    if (!item) {
        return {
            sucesso: false,
            mensagem: '❌ Item não encontrado! Use .loja para ver itens disponíveis.'
        };
    }
    
    if (player.gold < item.preco) {
        return {
            sucesso: false,
            mensagem: `❌ Gold insuficiente!\n\n${item.nome}\n💰 Preço: ${item.preco}\n💸 Seu gold: ${player.gold}`
        };
    }
    
    player.gold -= item.preco;
    player.inventario[itemId] = (player.inventario[itemId] || 0) + 1;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `✅ *COMPRA REALIZADA!*\n\n${item.nome}\n💰 Pago: ${item.preco} gold\n💸 Restante: ${player.gold} gold`
    };
}

function verInventario(userId) {
    const player = getPlayer(userId);
    
    if (Object.keys(player.inventario).length === 0) {
        return {
            sucesso: true,
            mensagem: '📦 Seu inventário está vazio!\n\n💡 Use .loja para comprar itens.'
        };
    }
    
    let mensagem = '📦 *SEU INVENTÁRIO*\n\n';
    
    for (const [itemId, qtd] of Object.entries(player.inventario)) {
        const item = ITEMS[itemId];
        if (item) {
            mensagem += `${item.nome} x${qtd}\n`;
            if (item.renda) mensagem += `   💰 Renda: ${item.renda * qtd}/dia\n`;
            if (item.bonus) mensagem += `   ⚡ Bônus: +${item.bonus}%\n`;
            mensagem += '\n';
        }
    }
    
    return {
        sucesso: true,
        mensagem
    };
}

function depositar(userId, valor) {
    const player = getPlayer(userId);
    
    if (isNaN(valor) || valor <= 0) {
        return {
            sucesso: false,
            mensagem: '❌ Valor inválido!'
        };
    }
    
    if (player.gold < valor) {
        return {
            sucesso: false,
            mensagem: `❌ Gold insuficiente!\n💰 Seu gold: ${player.gold}`
        };
    }
    
    player.gold -= valor;
    player.banco += valor;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `🏦 *DEPÓSITO REALIZADO!*\n\n💰 Depositado: ${valor}\n🏦 Saldo banco: ${player.banco}\n💸 Gold restante: ${player.gold}`
    };
}

function sacar(userId, valor) {
    const player = getPlayer(userId);
    
    if (isNaN(valor) || valor <= 0) {
        return {
            sucesso: false,
            mensagem: '❌ Valor inválido!'
        };
    }
    
    if (player.banco < valor) {
        return {
            sucesso: false,
            mensagem: `❌ Saldo insuficiente no banco!\n🏦 Saldo: ${player.banco}`
        };
    }
    
    player.banco -= valor;
    player.gold += valor;
    saveData();
    
    return {
        sucesso: true,
        mensagem: `🏦 *SAQUE REALIZADO!*\n\n💰 Sacado: ${valor}\n💸 Gold atual: ${player.gold}\n🏦 Saldo banco: ${player.banco}`
    };
}

function getMenuRPG() {
    return `🎮 *MENU RPG - NEEXTCITY*

📊 *ECONOMIA:*
• .perfil - Ver seu perfil
• .trabalhar - Trabalhar e ganhar gold
• .estudar - Aumentar educação
• .depositar [valor] - Guardar no banco
• .sacar [valor] - Sacar do banco

🎣 *ATIVIDADES:*
• .pescar - Pescar peixes (45s cooldown)
• .minerar - Minerar recursos (60s cooldown)
• .coletar - Coletar itens (30s cooldown)

🏪 *LOJA:*
• .loja - Ver categorias
• .loja [categoria] - Ver itens
• .comprar [item] - Comprar item
• .inventario - Ver seus itens

💼 *TRABALHOS:*
📦 Entregador - 50-100 gold
🍽️ Garçom - 80-150 gold
👔 Vendedor - 100-200 gold
💻 Programador - 300-500 gold (Técnico)
⚕️ Médico - 800-1500 gold (Pós)

🎓 *EDUCAÇÃO:*
1️⃣ Fundamental (grátis)
2️⃣ Médio (1k)
3️⃣ Técnico (3k)
4️⃣ Superior (8k)
5️⃣ Pós (15k)`;
}

// Inicializa dados ao carregar módulo
loadData().catch(console.error);

module.exports = {
    ativarRPG,
    isRPGAtivo,
    registrar,
    isUsuarioRegistrado,
    getPerfil,
    trabalhar,
    estudar,
    pescar,
    minerar,
    coletar,
    verLoja,
    comprar,
    verInventario,
    depositar,
    sacar,
    getMenuRPG
};
