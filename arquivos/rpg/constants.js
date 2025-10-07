// Constantes do Sistema RPG

const ITEMS = {
    // Propriedades
    barraca: { nome: '⛺ Barraca', preco: 500, tipo: 'propriedade', renda: 10, desc: 'Renda passiva: 10 gold/dia' },
    casa: { nome: '🏠 Casa', preco: 15000, tipo: 'propriedade', renda: 50, desc: 'Renda passiva: 50 gold/dia' },
    mansao: { nome: '🏰 Mansão', preco: 300000, tipo: 'propriedade', renda: 500, desc: 'Renda passiva: 500 gold/dia' },
    
    // Veículos
    bicicleta: { nome: '🚲 Bicicleta', preco: 800, tipo: 'veiculo', bonus: 15, desc: '+15% velocidade' },
    moto: { nome: '🏍️ Moto', preco: 15000, tipo: 'veiculo', bonus: 30, desc: '+30% velocidade' },
    carro: { nome: '🚗 Carro', preco: 40000, tipo: 'veiculo', bonus: 50, desc: '+50% velocidade' },
    ferrari: { nome: '🏁 Ferrari', preco: 1000000, tipo: 'veiculo', bonus: 100, desc: '+100% velocidade' },
    
    // Ferramentas
    vara: { nome: '🎣 Vara de Pesca', preco: 100, tipo: 'ferramenta', uso: 'pesca', bonus: 20, desc: '+20% na pesca' },
    picareta: { nome: '⛏️ Picareta', preco: 500, tipo: 'ferramenta', uso: 'mineracao', bonus: 30, desc: '+30% na mineração' },
    rifle: { nome: '🔫 Rifle', preco: 3000, tipo: 'ferramenta', uso: 'caca', bonus: 40, desc: '+40% na caça' },
    
    // Animais
    cachorro: { nome: '🐕 Cachorro', preco: 1000, tipo: 'animal', protecao: 30, desc: 'Proteção: 30%' },
    cavalo: { nome: '🐴 Cavalo', preco: 8000, tipo: 'animal', velocidade: 25, desc: 'Velocidade: 25%' },
    dragao: { nome: '🐲 Dragão', preco: 1000000, tipo: 'animal', protecao: 100, desc: 'Proteção: 100%' }
};

const TRABALHOS = {
    entregador: { 
        nome: '📦 Entregador', 
        salario: [50, 100], 
        cooldown: 60000,
        educacaoMin: 1,
        desc: '50-100 gold | 1min cooldown'
    },
    garcom: { 
        nome: '🍽️ Garçom', 
        salario: [80, 150], 
        cooldown: 60000,
        educacaoMin: 1,
        desc: '80-150 gold | 1min cooldown'
    },
    vendedor: { 
        nome: '👔 Vendedor', 
        salario: [100, 200], 
        cooldown: 60000,
        educacaoMin: 2,
        desc: '100-200 gold | 1min cooldown | Requer: Médio'
    },
    programador: { 
        nome: '💻 Programador', 
        salario: [300, 500], 
        cooldown: 120000,
        educacaoMin: 3,
        desc: '300-500 gold | 2min cooldown | Requer: Técnico'
    },
    medico: { 
        nome: '⚕️ Médico', 
        salario: [800, 1500], 
        cooldown: 180000,
        educacaoMin: 5,
        desc: '800-1500 gold | 3min cooldown | Requer: Pós-graduação'
    }
};

const EDUCACAO = {
    1: { nome: 'Fundamental', custo: 0 },
    2: { nome: 'Médio', custo: 1000 },
    3: { nome: 'Técnico', custo: 3000 },
    4: { nome: 'Superior', custo: 8000 },
    5: { nome: 'Pós-graduação', custo: 15000 }
};

const COOLDOWNS = {
    trabalhar: 0, // Dinâmico baseado no trabalho
    pescar: 45000, // 45 segundos
    minerar: 60000, // 1 minuto
    coletar: 30000, // 30 segundos
    cacar: 90000, // 1.5 minutos
    assaltar: 300000, // 5 minutos
    tigrinho: 60000, // 1 minuto
    daily: 86400000 // 24 horas
};

const ATIVIDADES = {
    pescar: {
        nome: '🎣 Pesca',
        ganho: [30, 80],
        ferramenta: 'vara',
        emoji: '🎣',
        stat: 'pescadas'
    },
    minerar: {
        nome: '⛏️ Mineração',
        ganho: [40, 100],
        ferramenta: 'picareta',
        emoji: '⛏️',
        stat: 'mineracoes'
    },
    coletar: {
        nome: '🌿 Coleta',
        ganho: [20, 60],
        ferramenta: null,
        emoji: '🌿',
        stat: 'coletas'
    },
    cacar: {
        nome: '🏹 Caça',
        ganho: [100, 200],
        ferramenta: 'rifle',
        emoji: '🏹',
        stat: 'cacadas'
    }
};

module.exports = {
    ITEMS,
    TRABALHOS,
    EDUCACAO,
    COOLDOWNS,
    ATIVIDADES
};
