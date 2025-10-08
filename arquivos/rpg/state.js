// Sistema RPG NeextCity - Gerenciamento de Estado
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../database/grupos/rpg_data.json');
const VERSION = '2.0';

// Cache de dados em memória
let dataCache = null;
let saveTimeout = null;

// ==================== SCHEMAS ====================

function createNewPlayer() {
    return {
        version: VERSION,
        gold: 500,
        banco: 0,
        xp: 0,
        nivel: 1,
        educacao: 1,
        inventario: {},
        trabalho: null,
        cooldowns: {
            trabalhar: 0,
            pescar: 0,
            minerar: 0,
            coletar: 0,
            cacar: 0,
            assaltar: 0,
            tigrinho: 0,
            daily: 0
        },
        stats: {
            totalGanho: 0,
            totalGasto: 0,
            pescadas: 0,
            mineracoes: 0,
            coletas: 0,
            cacadas: 0,
            trabalhos: 0
        },
        registrado: Date.now(),
        ultimoDaily: 0
    };
}

function createNewGroup() {
    return {
        version: VERSION,
        rpgAtivo: false,
        players: [],
        criado: Date.now()
    };
}

// ==================== PERSISTÊNCIA ====================

async function loadData() {
    if (dataCache) return dataCache;
    
    try {
        const content = await fs.readFile(DATA_FILE, 'utf8');
        dataCache = JSON.parse(content);
        
        // Migração de versão se necessário
        if (!dataCache.version || dataCache.version !== VERSION) {
            // console.log('🔄 Migrando dados do RPG para versão', VERSION);
            dataCache.version = VERSION;
            if (!dataCache.players) dataCache.players = {};
            if (!dataCache.grupos) dataCache.grupos = {};
        }
    } catch (err) {
        console.log('📝 Criando novo arquivo de dados RPG');
        dataCache = {
            version: VERSION,
            grupos: {},
            players: {}
        };
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
            console.error('❌ Erro ao salvar dados RPG:', err);
        }
    }, 500);
}

// ==================== ACCESSORS ====================

function getPlayer(userId) {
    if (!dataCache || !dataCache.players) {
        dataCache = { version: VERSION, grupos: {}, players: {} };
    }
    
    if (!dataCache.players[userId]) {
        dataCache.players[userId] = createNewPlayer();
    }
    
    // Garante que cooldowns existem
    if (!dataCache.players[userId].cooldowns) {
        dataCache.players[userId].cooldowns = {
            trabalhar: 0,
            pescar: 0,
            minerar: 0,
            coletar: 0,
            cacar: 0,
            assaltar: 0,
            tigrinho: 0,
            daily: 0
        };
    }
    
    // Garante que stats existem
    if (!dataCache.players[userId].stats) {
        dataCache.players[userId].stats = {
            totalGanho: 0,
            totalGasto: 0,
            pescadas: 0,
            mineracoes: 0,
            coletas: 0,
            cacadas: 0,
            trabalhos: 0
        };
    }
    
    return dataCache.players[userId];
}

function getGroup(groupId) {
    if (!dataCache || !dataCache.grupos) {
        dataCache = { version: VERSION, grupos: {}, players: {} };
    }
    
    if (!dataCache.grupos[groupId]) {
        dataCache.grupos[groupId] = createNewGroup();
    }
    
    return dataCache.grupos[groupId];
}

function getAllPlayers() {
    if (!dataCache || !dataCache.players) return {};
    return dataCache.players;
}

function isPlayerRegistered(userId) {
    if (!dataCache || !dataCache.players) return false;
    return !!dataCache.players[userId];
}

function isGroupActive(groupId) {
    const group = getGroup(groupId);
    return group.rpgAtivo === true;
}

// ==================== COOLDOWN HELPERS ====================

function checkCooldown(player, activity) {
    const now = Date.now();
    const lastTime = player.cooldowns[activity] || 0;
    return { onCooldown: now < lastTime, remaining: Math.max(0, lastTime - now) };
}

function setCooldown(player, activity, durationMs) {
    player.cooldowns[activity] = Date.now() + durationMs;
}

// ==================== ECONOMIA HELPERS ====================

function addGold(player, amount) {
    player.gold += amount;
    player.stats.totalGanho += amount;
}

function removeGold(player, amount) {
    if (player.gold < amount) return false;
    player.gold -= amount;
    player.stats.totalGasto += amount;
    return true;
}

function addXP(player, amount) {
    player.xp += amount;
    
    // Verifica level up
    const xpNeeded = player.nivel * 100;
    if (player.xp >= xpNeeded) {
        player.nivel++;
        player.xp = 0;
        return { leveledUp: true, newLevel: player.nivel };
    }
    
    return { leveledUp: false };
}

// Inicializa dados ao carregar módulo
loadData().catch(console.error);

module.exports = {
    loadData,
    saveData,
    getPlayer,
    getGroup,
    getAllPlayers,
    isPlayerRegistered,
    isGroupActive,
    checkCooldown,
    setCooldown,
    addGold,
    removeGold,
    addXP,
    createNewPlayer,
    createNewGroup
};
