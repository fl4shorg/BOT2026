// menu.js - Sistema de menus organizados do bot NEEXT LTDA

// Função para obter configurações atualizadas em tempo real
function obterConfiguracoes() {
    delete require.cache[require.resolve('../settings/settings.json')];
    return require('../settings/settings.json');
}

// Importa funções utilitárias
const { obterSaudacao, contarGrupos, contarComandos } = require('../arquivos/funcoes/function.js');
const { obterEstatisticas } = require('../arquivos/registros.js');

// Função para verificar se é dono (por LID)
function isDono(userId) {
    if (!userId) return false;
    
    const userLid = userId.split('@')[0].split(':')[0];
    const config = obterConfiguracoes();
    
    // Verifica dono oficial
    if (config.lidDono && userLid === config.lidDono) {
        return true;
    }
    
    // Verifica donos adicionais
    try {
        const path = require('path');
        const necessaryPath = path.join(__dirname, "..", "settings", "necessary.json");
        const fs = require('fs');
        if (fs.existsSync(necessaryPath)) {
            delete require.cache[require.resolve('../settings/necessary.json')];
            const donosAdicionais = require('../settings/necessary.json');
            
            for (const key in donosAdicionais) {
                const donoLid = donosAdicionais[key];
                if (donoLid && userLid === donoLid) {
                    return true;
                }
            }
        }
    } catch (err) {
        // Ignora erro
    }
    
    return false;
}

// Função para determinar cargo do usuário
async function obterCargoUsuario(sock, from, sender) {
    try {
        // Verifica se é o dono (usando LID)
        if (isDono(sender)) {
            return "👑 Dono";
        }

        // Se estiver em grupo, verifica se é admin
        if (from.endsWith('@g.us') || from.endsWith('@lid')) {
            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === sender);
                if (participant && (participant.admin === 'admin' || participant.admin === 'superadmin')) {
                    return "🛡️ Admin";
                }
            } catch (err) {
                // Se der erro, assume membro
            }
        }

        return "👤 Membro";
    } catch (err) {
        return "👤 Membro";
    }
}

// ========================
// MENU PRINCIPAL - NOVO FORMATO
// ========================
async function obterMenuPrincipal(sock, from, sender, pushName) {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    
    try {
        // Obter informações dinâmicas
        const saudacao = obterSaudacao();
        const totalComandos = contarComandos();
        const totalGrupos = await contarGrupos(sock);
        const estatisticasRegistros = obterEstatisticas();
        const cargoUsuario = await obterCargoUsuario(sock, from, sender);
        const nomeUsuario = pushName || "Usuário";
        
        return `${saudacao}! 👋

╭──〔 𖦹∘̥⸽⃟ INFORMAÇÕES 〕──⪩
│ 𖦹∘̥⸽🎯⃟ Prefixo: 「 ${prefix} 」
│ 𖦹∘̥⸽📊⃟ Total de Comandos: ${totalComandos}
│ 𖦹∘̥⸽🤖⃟ Nome do Bot: ${nomeDoBot}
│ 𖦹∘̥⸽👤⃟ Usuário: ${nomeUsuario}
│ 𖦹∘̥⸽🛠️⃟ Versão: ^7.0.0-rc.3
│ 𖦹∘̥⸽👑⃟ Dono: ${nickDoDono}
│ 𖦹∘̥⸽📈⃟ Total de Grupos: ${totalGrupos}
│ 𖦹∘̥⸽📝⃟ Total Registrado: ${estatisticasRegistros.totalRegistros}
│ 𖦹∘̥⸽🎗️⃟ Cargo: ${cargoUsuario.split(' ')[1]}
╰───────────────────⪨

╭──〔 MENUS DISPONÍVEIS 〕──⪩
│ 𖧈∘̥⸽🏠⃟ menuPrincipal
│ 𖧈∘̥⸽🎬⃟ menudownload
│ 𖧈∘̥⸽🖼️⃟ menufigurinhas
│ 𖧈∘̥⸽🔞⃟ menuhentai
│ 𖧈∘̥⸽🛠️⃟ menuadm
│ 𖧈∘̥⸽👑⃟ menudono
│ 𖧈∘̥⸽🎉⃟ menubrincadeira
│ 𖧈∘̥⸽🧑‍🤝‍🧑⃟ menuMembro
│ 𖧈∘̥⸽🎮⃟ menuGamer
│ 𖧈∘̥⸽🌐⃟ menuNeext
│ 𖧈∘̥⸽🎲⃟ menurandom
╰──────────────────────⪨

© NEEXT LTDA`;
    } catch (error) {
        console.error('Erro ao gerar menu principal:', error);
        // Fallback para menu simples
        return `🤖 *${nomeDoBot} - MENU PRINCIPAL*\n\n📋 *CATEGORIAS DISPONÍVEIS:*\n\n👥 \`${prefix}menumembro\` - Comandos para membros\n🛡️ \`${prefix}menuadmin\` - Comandos administrativos\n👑 \`${prefix}menudono\` - Comandos do dono\n\n━━━━━━━━━━━━━━━\n© NEEXT LTDA - ${nickDoDono}`;
    }
}

// ========================
// MENU MEMBRO (comandos básicos)
// ========================
function obterMenuMembro() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
👥 *COMANDOS PARA MEMBROS*

🤖 *INFORMAÇÕES DO BOT:*
• \`${prefix}ping\` - Status e informações do sistema
• \`${prefix}hora\` - Horário atual
• \`${prefix}dono\` - Informações do dono
• \`${prefix}recado\` - Confirma que o bot está ativo
• \`prefixo\` - Mostra o prefixo atual

📝 *UTILITÁRIOS:*
• \`${prefix}status [texto]\` - Atualiza status do bot
• \`${prefix}rg\` - Registra-se no sistema do bot
• \`${prefix}hermitwhite [dados]\` - Cria ID no sistema NEEXT

📚 *CONHECIMENTO:*
• \`${prefix}pensador [personagem]\` - Frases de pensadores
• \`${prefix}frasesanime\` - Frases de animes
• \`${prefix}wikipedia [assunto]\` - Busca na Wikipedia

🎲 *DIVERSÃO:*
• \`${prefix}chance [texto]\` - Calcula chance de algo acontecer
• \`${prefix}correio [número]/[mensagem]\` - Envia mensagem anônima

🏷️ *STICKERS:*
• \`${prefix}s\` - Converte mídia em sticker
• \`${prefix}rename [pack|author]\` - Renomeia sticker

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU ADMIN (comandos administrativos)
// ========================
function obterMenuAdmin() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🛡️ *COMANDOS ADMINISTRATIVOS*

👥 *GERENCIAMENTO DE GRUPO:*
• \`${prefix}marca\` - Menciona todos os membros
• \`${prefix}fechargrupo\` / \`${prefix}fechar\` - Fecha o grupo
• \`${prefix}abrirgrupo\` / \`${prefix}abrir\` - Abre o grupo
• \`${prefix}mudargrupo [nome]\` - Altera nome do grupo
• \`${prefix}resetlink\` - Gera novo link do grupo

🗑️ *MODERAÇÃO:*
• \`${prefix}del\` - Deleta mensagem marcada
• \`${prefix}ativarsolicitacao\` - Ativa aprovação de membros
• \`${prefix}desativarsolicitacao\` - Desativa aprovação
• \`${prefix}soloadmin\` - Apenas admins editam grupo

⚙️ *CONFIGURAÇÕES:*
• \`${prefix}antilink on/off\` - Liga/desliga antilink
• \`${prefix}modogamer on/off\` - Liga/desliga modo gamer
• \`${prefix}rpg on/off\` - Liga/desliga sistema RPG

📊 *STATUS:*
• \`${prefix}grupo-status\` - Status do grupo
• \`${prefix}status-anti\` - Status sistemas anti-spam

⚠️ *Requer: Admin do grupo + Bot admin*

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU DONO (comandos exclusivos)
// ========================
function obterMenuDono() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
👑 *COMANDOS DO DONO*

⚙️ *CONFIGURAÇÕES DO BOT:*
• \`${prefix}trocar-prefixo [novo]\` - Altera prefixo
• \`${prefix}trocar-nome [novo]\` - Altera nome do bot
• \`${prefix}trocar-nick [novo]\` - Altera nick do dono
• \`${prefix}configurar-bot\` - Guia de configurações

🛡️ *PROTEÇÃO AVANÇADA:*
• \`${prefix}antipv on/off\` - Bloqueia PVs de não-donos
• \`${prefix}anticall on/off\` - Rejeita chamadas automaticamente

🔧 *CONTROLE TOTAL:*
• Todos os comandos de admin funcionam
• Bypass de todas as restrições
• Controle completo sobre configurações

⚠️ *Acesso exclusivo para: ${nickDoDono}*

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU DOWNLOAD (mídia e downloads)
// ========================
function obterMenuDownload() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `╭─━─━⋆｡°✩📥✩°｡⋆ ━─━─╮
│      𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒
╰─━─━⋆｡°✩📥✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮  

│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟💿￫ ${prefix}playspotify [nome]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}spotifysearch [nome]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}spotify [link]
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟💿￫ ${prefix}play [nome]
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟💿￫ ${prefix}pinterest [busca]
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟💿￫ ${prefix}ig [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}instagram [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}tiktok [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}tt [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}twitter [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}facebook [link]
│┊𖥨ํ∘̥⃟💿￫ ${prefix}fb [link]
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯

╭─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╮
│     © ɴᴇᴇxᴛ ʟᴛᴅᴀ - ɴᴇᴇxᴛ
╰─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╯`;
}

// ========================
// MENU GAMER (jogos e entretenimento)
// ========================
function obterMenuGamer() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🎮 *JOGOS E ENTRETENIMENTO*

⚠️ *Requer \`${prefix}modogamer on\` ativo no grupo*

🎯 *JOGOS INTERATIVOS:*
• \`${prefix}jogodavelha @user\` - Jogo da velha
• \`${prefix}roletarussa @user\` - Roleta russa
• \`${prefix}disparar\` - Atirar na roleta russa
• \`${prefix}resetjogodavelha\` - Reset jogo da velha
• \`${prefix}resetroleta\` - Reset roleta russa

♟️ *XADREZ:*
• \`${prefix}xadrez @oponente\` - Iniciar partida
• \`${prefix}xadrez jogada e2e4\` - Fazer jogada
• \`${prefix}xadrez status\` - Ver tabuleiro
• \`${prefix}xadrez desistir\` - Desistir da partida
• \`${prefix}xadrez ranking\` - Ver ranking
• \`${prefix}xadrez player [nome]\` - Buscar jogador Chess.com
• \`${prefix}xadrez ajuda\` - Ajuda completa

🎲 *DIVERSÃO:*
• \`${prefix}eununca\` - Eu nunca poll
• \`${prefix}impostor\` - Escolhe impostor aleatório

💥 *AÇÕES DIVERTIDAS:*
• \`${prefix}tapa @user\` - Dar tapa
• \`${prefix}matar @user\` - Matar alguém
• \`${prefix}atirar @user\` - Atirar em alguém
• \`${prefix}atropelar @user\` - Atropelar
• \`${prefix}beijar @user\` - Beijar alguém
• \`${prefix}prender @user\` - Prender alguém
• \`${prefix}sarra @user\` - Sarrar em alguém
• \`${prefix}dedo @user\` - Mostrar dedo

📊 *RANKINGS DIVERTIDOS:*
• \`${prefix}rankcorno\` - Rank dos cornos
• \`${prefix}rankgay\` - Rank dos gays
• \`${prefix}ranklesbica\` - Rank das lésbicas
• \`${prefix}rankburro\` - Rank dos burros
• \`${prefix}rankfeio\` - Rank dos feios
• \`${prefix}rankbonito\` - Rank dos bonitos
• \`${prefix}rankfumante\` - Rank dos fumantes
• \`${prefix}rankmaconheiro\` - Rank dos maconheiros
• \`${prefix}rankpobre\` - Rank dos pobres
• \`${prefix}ranksad\` - Rank dos tristes
• \`${prefix}rankemo\` - Rank dos emos
• \`${prefix}rankcasal\` - Rank de casais

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU ADM (todos os comandos de administradores)
// ========================
function obterMenuAdm() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `╭═════════════════ ⪩
╎╭─━─━⋆｡°✩🪷✩°｡⋆ ━─━─╮
│      𝐂❍̸𝐌𝚫𝚴𝐃❍̸𝐒 𝚫𝐃𝐌𝐒   
╰─━─━⋆｡°✩🪷✩°｡⋆ ━─━─╯
╎
╎╭╌❅̸╌═⊱⋇⊰🏮⊱⋇⊰═╌❅̸╌╮
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}x9 on/off - Anti-X9 Monitor
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antilink on/off - Anti-links
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antilinkhard on/off - Anti-links avançado
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}anticontato on/off - Anti-contatos
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antidocumento on/off - Anti-documentos
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antivideo on/off - Anti-vídeos
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antiaudio on/off - Anti-áudios
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antisticker on/off - Anti-stickers
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antiflod on/off - Anti-flood
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antifake on/off - Anti-números fake
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antiporno on/off - Anti-pornografia
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antipalavrao on/off - Anti-palavrões
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}listanegra add @user - Adicionar usuário
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}listanegra remove @user - Remover usuário
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}listanegra list - Ver lista negra
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}del - Deleta mensagem marcada
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}marca - Menciona todos os membros
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}hidetag [texto] - Marcação oculta
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}fechargrupo - Fecha o grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}abrirgrupo - Abre o grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}mudargrupo [nome] - Altera nome do grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}soloadmin - Só admin edita grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}resetlink - Gera novo link do grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}ativarsolicitacao - Ativa aprovação
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}desativarsolicitacao - Desativa aprovação
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}modogamer on/off - Modo gamer
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}grupo-status - Status do grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}fotodogrupo - Troca foto do grupo
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}fotodobot - Troca foto do bot
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}opengp HH:MM - Agendar abertura automática
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}closegp HH:MM - Agendar fechamento automático
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}time-status - Ver agendamentos do grupo
╎╰╌❅̸╌═⊱⋇⊰🏮⊱⋇⊰═╌❅̸╌╯
╰══════════════════ ⪨
© NEEXT LTDA
`;
}

// ========================
// MENU ANTI-SPAM
// ========================
function obterMenuAnti() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🛡️ *SISTEMA ANTI-SPAM*

⚠️ *Requer: Admin + Bot admin*

🔗 *PROTEÇÕES DISPONÍVEIS:*
• \`${prefix}antilink on/off\` - Anti-links
• \`${prefix}antilinkhard on/off\` - Anti-links avançado
• \`${prefix}anticontato on/off\` - Anti-contatos
• \`${prefix}antidocumento on/off\` - Anti-documentos
• \`${prefix}antivideo on/off\` - Anti-vídeos
• \`${prefix}antiaudio on/off\` - Anti-áudios
• \`${prefix}antisticker on/off\` - Anti-stickers
• \`${prefix}antiflod on/off\` - Anti-flood
• \`${prefix}antifake on/off\` - Anti-números fake
• \`${prefix}antiporno on/off\` - Anti-pornografia
• \`${prefix}antipalavrao on/off\` - Anti-palavrões
• \`${prefix}x9 on/off\` - Anti-X9

📋 *LISTA NEGRA:*
• \`${prefix}listanegra add @user\` - Adicionar à lista
• \`${prefix}listanegra remove @user\` - Remover da lista
• \`${prefix}listanegra list\` - Ver lista negra

📊 *STATUS:*
• \`${prefix}status-anti\` - Ver todas as proteções ativas

🔴 *AÇÃO: Delete automático + Ban (se bot for admin)*

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU RPG (sistema NeextCity)
// ========================
function obterMenuRPG() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
💰 *SISTEMA RPG - NEEXTCITY MEGA 2.0*

⚠️ *Requer \`${prefix}rpg on\` ativo no grupo*

👤 *CADASTRO:*
• \`${prefix}registrar [nome] [banco]\` - Registrar no RPG
• \`${prefix}saldo\` - Ver saldo e estatísticas
• \`${prefix}perfil\` - Ver perfil completo
• \`${prefix}rank\` - Ranking dos mais ricos

💼 *TRABALHOS (GANHAR GOLD):*
• \`${prefix}pescar\` - Pescar para ganhar gold (vara necessária)
• \`${prefix}minerar\` - Minerar recursos preciosos (picareta necessária)
• \`${prefix}trabalhar\` - Trabalhar com base nos seus itens
• \`${prefix}cacar\` - Caçar animais selvagens (rifle necessário)
• \`${prefix}coletar\` - Coletar itens da natureza
• \`${prefix}agricultura\` - Plantar e colher (sementes e fazenda necessárias)
• \`${prefix}entrega\` - Fazer entregas na cidade

🏴‍☠️ *ATIVIDADES ILEGAIS:*
• \`${prefix}assalto @user\` - Assaltar outro jogador
• \`${prefix}roubar [local]\` - Roubar locais (casas, lojas, bancos)

🛒 *LOJA E INVENTÁRIO (8 CATEGORIAS):*
• \`${prefix}loja\` - Ver todas as 8 categorias
• \`${prefix}loja propriedades\` - Casas, fazendas, hotéis, ilhas
• \`${prefix}loja animais\` - Pets, criações, dragões
• \`${prefix}loja ferramentas\` - Picaretas, varas, rifles, sementes
• \`${prefix}loja veiculos\` - Carros, motos, aviões, foguetes
• \`${prefix}loja negocios\` - Empresas, restaurantes, multinacionais
• \`${prefix}loja tecnologia\` - Computadores, setups, estúdios
• \`${prefix}loja decoracao\` - Móveis, arte, piscinas
• \`${prefix}loja seguranca\` - Proteções, blindagem, bunkers
• \`${prefix}comprar [item_id] [qtd]\` - Comprar itens (1-10)
• \`${prefix}inventario\` - Ver seus itens

🎥 *INFLUENCIADOR DIGITAL:*
• \`${prefix}youtube\` - Criar vídeo no YouTube (setup necessário)
• \`${prefix}tiktok\` - Criar vídeo no TikTok (setup necessário)
• \`${prefix}twitch\` - Fazer stream na Twitch (setup necessário)

🎰 *JOGOS E INVESTIMENTOS:*
• \`${prefix}tigrinho [valor]\` - Caça-níquel
• \`${prefix}apostar [valor]\` - Apostar na sorte
• \`${prefix}investir [tipo] [valor]\` - 7 tipos de investimentos

📚 *EDUCAÇÃO E CRESCIMENTO:*
• \`${prefix}estudar\` - Ver cursos disponíveis
• \`${prefix}estudar [num]\` - Fazer curso específico

💸 *SISTEMA BANCÁRIO:*
• \`${prefix}pix @user [valor]\` - Transferir gold (18 bancos disponíveis)

⚠️ *RECURSOS AVANÇADOS:*
• Limites diários realistas (8 pescas, 6 minerações, 4 trabalhos)
• Sistema de riscos (mortes, acidentes, prisões)
• 100+ itens únicos com benefícios específicos
• Progressão educacional (7 níveis de estudo)
• Cooldowns balanceados para gameplay justo

🌟 *NOVIDADES MEGA 2.0:*
✅ Loja com 8 categorias e 100+ itens
✅ Sistema YouTuber/TikTok/Twitch
✅ Comando roubar com 12 locais
✅ 18 bancos diferentes para escolher
✅ Riscos realistas (mortes, falhas)
✅ Ferramentas obrigatórias para trabalhos
✅ Limites diários para gameplay equilibrado

💸 *SISTEMA BANCÁRIO:*
• \`${prefix}pix @user [valor]\` - Transferir gold
• \`${prefix}saldo\` - Ver saldo e estatísticas
• \`${prefix}rank\` - Ranking dos mais ricos

🏪 *CATEGORIAS DA LOJA:*
• **Propriedades** - Casas, fazendas, empresas
• **Animais** - Galinhas, cavalos, gatos
• **Veículos** - Motos, carros, aviões
• **Ferramentas** - Varas, picaretas, tratores
• **Negócios** - Lanchonetes, academias

💡 *Ganhe gold, compre itens e domine NeextCity!*

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU STICKERS (figurinhas)
// ========================
function obterMenuSticker() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🏷️ *MENU DE STICKERS*

✨ *CRIAR STICKERS:*
• \`${prefix}s\` - Converte mídia em sticker
• \`${prefix}sticker\` - Criar sticker de imagem/vídeo
• \`${prefix}attp [texto]\` - Sticker de texto animado
• \`${prefix}ttp [texto]\` - Sticker de texto simples

🎨 *EDITAR STICKERS:*
• \`${prefix}rename [pack|author]\` - Renomear sticker
• \`${prefix}take [pack] [author]\` - Roubar sticker
• \`${prefix}toimg\` - Converter sticker em imagem

🎭 *STICKERS ESPECIAIS:*
• \`${prefix}emoji [emoji]\` - Sticker de emoji
• \`${prefix}semoji [emoji]\` - Sticker emoji simples

📝 *COMO USAR:*
• Envie uma imagem/vídeo com \`${prefix}s\`
• Marque um sticker e use \`${prefix}take\`
• Use \`${prefix}rename\` para personalizar

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU FIGURINHAS (pacotes de stickers)
// ========================
function obterMenuFigurinhas() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `╭─━─━⋆｡°✩🎨✩°｡⋆ ━─━─╮
│        𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒    
╰─━─━⋆｡°✩🎨✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮  
│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasanime - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasmeme - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasengracadas - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasemoji - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhascoreana - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasdesenho - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasraiva - Figurinhas aleatórias
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}figurinhasroblox - Figurinhas aleatórias
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}s - Criar sticker de mídia
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}brat [texto] - Gerar imagem BRAT
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}rename [pack|autor] - Editar sticker
│╰─━─⋆｡°✩🏮✩°｡⋆ ━─━╯
╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯

╭─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╮
│     © ɴᴇᴇxᴛ ʟᴛᴅᴀ - ɴᴇᴇxᴛ
╰─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╯`;
}

// ========================
// MENU BRINCADEIRAS (coming soon)
// ========================
function obterMenuBrincadeira() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🎉 *MENU BRINCADEIRAS*

⚠️ *EM DESENVOLVIMENTO*

🚧 Este menu está sendo finalizado e em breve terá:

🎭 **Comandos de Diversão:**
• Roleta de perguntas
• Verdade ou desafio
• Simulador de namorados
• Gerador de casais aleatórios

🎲 **Interações Divertidas:**
• Perguntas para o grupo
• Desafios aleatórios
• Brincadeiras de grupo

📅 **Status:** Em desenvolvimento
⏰ **Previsão:** Próxima atualização

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU HENTAI
// ========================
function obterMenuHentai() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `╭─━─━⋆｡°✩🔞✩°｡⋆ ━─━─╮
│        𝐌𝐄𝐍𝐔 𝐇𝐄𝐍𝐓𝐀𝐈
╰─━─━⋆｡°✩🔞✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮  

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🎌 *CATEGORIAS GERAIS*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}hentai - Hentai aleatório
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}yaoi - Yaoi aleatório
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}yuri - Yuri aleatório
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}nude - Nude aleatório
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}sex - Sex aleatório
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🔗 *BONDAGE & BDSM*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bondage - Bondage
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bdsm - BDSM
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bondage_solo - Bondage solo
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bondage_group - Bondage group
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}gag - Mordaça
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}whip - Chicote
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}handcuffs - Algemas
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 💋 *ATOS SEXUAIS*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}anal - Anal
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}oral - Oral
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}blowjob - Boquete
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}handjob - Punheta
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}footjob - Pézão
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}vaginal - Vaginal
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}oral_sex - Sexo oral
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}masturbation - Masturbação
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}cumshot - Ejaculação
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}creampie - Gozo interno
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 👗 *ROUPAS & ACESSÓRIOS*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}panties - Calcinha
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bra - Sutiã
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}lingerie - Lingerie
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}swimsuit - Maiô
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}bikini - Biquíni
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}stockings - Meias
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}corset - Espartilho
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}dress - Vestido
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}skirt - Saia
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🎭 *DOMINAÇÃO*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}futa - Futanari
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}femdom - Dominação feminina
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}dominant - Dominante
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}submissive - Submissa
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}face_sitting - Sentada na cara
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 👥 *GRUPO & MÚLTIPLOS*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}group_sex - Sexo em grupo
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}threesome - Ménage à trois
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}foursome - Quateto
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}orgy - Orgia
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}double_penetration - Dupla penetração
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🎯 *ESPECÍFICOS*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}tentacle - Tentáculos
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}lactation - Lactação
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}sex_toy - Brinquedo sexual
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}massage - Massagem
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}teacher_student - Professor/Aluno
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🔞 *PARTES DO CORPO*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}breasts - Seios
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}nipples - Mamilos
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}ass - Bunda
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}thighs - Coxas
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}pussy - Buceta
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🩸✩°｡⋆ ━─━╮
│ 🎪 *VARIAÇÕES*
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}yuri_anal - Yuri anal
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}yaoi_anal - Yaoi anal
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}futa_anal - Futa anal
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}maid_nsfw - Empregada NSFW
│┊𖥨ํ∘̥⃟🩸￫ ${prefix}school_uniform_nsfw - Uniforme NSFW
│╰─━─⋆｡°✩🩸✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯

╭─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╮
│     © ɴᴇᴇxᴛ ʟᴛᴅᴀ - ɴᴇᴇxᴛ
╰─━─━⋆｡°✩🧩✩°｡⋆ ━─━─╯`;
}

// ========================
// MENU DONO AVANÇADO (coming soon)
// ========================
function obterMenuDonoAvancado() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
👑 *MENU DONO AVANÇADO*

⚠️ *EM DESENVOLVIMENTO*

🚧 Este menu está sendo finalizado e em breve terá:

🔧 **Controle Total:**
• Backup de configurações
• Gerenciamento de grupos em massa
• Logs detalhados do sistema
• Controle de usuários globais

⚙️ **Configurações Avançadas:**
• Auto-moderação inteligente
• Respostas automáticas personalizadas
• Sistema de recompensas

📅 **Status:** Em desenvolvimento
⏰ **Previsão:** Próxima atualização

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// GUIA DE CONFIGURAÇÃO
// ========================
function obterConfigurarBot() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
⚙️ *CONFIGURAR BOT - GUIA COMPLETO*

🔧 *COMANDOS DE CONFIGURAÇÃO (Apenas Dono):*

📝 *ALTERAR PREFIXO:*
\`${prefix}trocar-prefixo [novo]\`
*Exemplo:* \`${prefix}trocar-prefixo !\`
*Resultado:* Prefixo mudará de "${prefix}" para "!"

🤖 *ALTERAR NOME DO BOT:*
\`${prefix}trocar-nome [novo nome]\`
*Exemplo:* \`${prefix}trocar-nome MeuBot Incrível\`
*Resultado:* Nome mudará de "${nomeDoBot}"

👤 *ALTERAR NICK DO DONO:*
\`${prefix}trocar-nick [novo nick]\`
*Exemplo:* \`${prefix}trocar-nick Administrador\`
*Resultado:* Nick mudará de "${nickDoDono}"

📋 *CONFIGURAÇÕES ATUAIS:*
• **Prefixo:** ${prefix}
• **Nome do Bot:** ${nomeDoBot}
• **Nick do Dono:** ${nickDoDono}

⚠️ *IMPORTANTE:*
• Apenas o dono pode usar esses comandos
• As mudanças são aplicadas instantaneamente
• Configurações são salvas automaticamente

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

// ========================
// MENU RANDOM - DANBOORU
// ========================
function obterMenuRandom() {
    const { prefix, nomeDoBot, nickDoDono } = obterConfiguracoes();
    return `
🎲 *MENU RANDOM - DANBOORU API*

🎨 *PERSONAGENS E GRUPOS:*
• \`${prefix}1girl\` - 1 garota
• \`${prefix}1boy\` - 1 garoto  
• \`${prefix}2girls\` - 2 garotas
• \`${prefix}solo\` - Solo
• \`${prefix}group\` - Grupo
• \`${prefix}female\` - Feminino
• \`${prefix}male\` - Masculino

👤 *CARACTERÍSTICAS:*
• \`${prefix}long_hair\` - Cabelo longo
• \`${prefix}short_hair\` - Cabelo curto
• \`${prefix}smile\` - Sorriso
• \`${prefix}blush\` - Corado
• \`${prefix}happy\` - Feliz
• \`${prefix}sad\` - Triste
• \`${prefix}angry\` - Bravo

👗 *ROUPAS E UNIFORMES:*
• \`${prefix}cosplay\` - Cosplay
• \`${prefix}uniform\` - Uniforme
• \`${prefix}school_uniform\` - Uniforme escolar
• \`${prefix}maid\` - Empregada
• \`${prefix}nurse\` - Enfermeira
• \`${prefix}witch\` - Bruxa

⚔️ *AÇÃO E FANTASIA:*
• \`${prefix}armor\` - Armadura
• \`${prefix}sword\` - Espada
• \`${prefix}gun\` - Arma
• \`${prefix}magic\` - Magia
• \`${prefix}fantasy\` - Fantasia

🤖 *ESTILOS:*
• \`${prefix}robot\` - Robô
• \`${prefix}cyberpunk\` - Cyberpunk
• \`${prefix}steampunk\` - Steampunk

👻 *CRIATURAS:*
• \`${prefix}vampire\` - Vampiro
• \`${prefix}demon\` - Demônio
• \`${prefix}angel\` - Anjo
• \`${prefix}ghost\` - Fantasma

🎃 *FESTAS E ESTAÇÕES:*
• \`${prefix}halloween\` - Halloween
• \`${prefix}christmas\` - Natal
• \`${prefix}summer\` - Verão
• \`${prefix}beach\` - Praia
• \`${prefix}winter\` - Inverno
• \`${prefix}snow\` - Neve
• \`${prefix}autumn\` - Outono
• \`${prefix}rain\` - Chuva

🌿 *NATUREZA:*
• \`${prefix}animal\` - Animal
• \`${prefix}flower\` - Flor
• \`${prefix}tree\` - Árvore
• \`${prefix}forest\` - Floresta
• \`${prefix}mountain\` - Montanha

🌅 *CENÁRIOS:*
• \`${prefix}scenery\` - Cenário
• \`${prefix}city\` - Cidade
• \`${prefix}building\` - Prédio
• \`${prefix}street\` - Rua
• \`${prefix}night\` - Noite
• \`${prefix}sunset\` - Pôr do sol
• \`${prefix}sunrise\` - Nascer do sol

☁️ *CÉUS E ÁGUAS:*
• \`${prefix}clouds\` - Nuvens
• \`${prefix}sky\` - Céu
• \`${prefix}moon\` - Lua
• \`${prefix}stars\` - Estrelas
• \`${prefix}river\` - Rio
• \`${prefix}lake\` - Lago
• \`${prefix}ocean\` - Oceano

🚗 *VEÍCULOS:*
• \`${prefix}train\` - Trem
• \`${prefix}car\` - Carro
• \`${prefix}bike\` - Bicicleta

🏫 *LOCAIS INTERNOS:*
• \`${prefix}school\` - Escola
• \`${prefix}classroom\` - Sala de aula
• \`${prefix}library\` - Biblioteca
• \`${prefix}room\` - Quarto
• \`${prefix}bed\` - Cama
• \`${prefix}chair\` - Cadeira
• \`${prefix}table\` - Mesa

🍰 *COMIDAS E BEBIDAS:*
• \`${prefix}food\` - Comida
• \`${prefix}drink\` - Bebida
• \`${prefix}coffee\` - Café
• \`${prefix}tea\` - Chá
• \`${prefix}cake\` - Bolo
• \`${prefix}chocolate\` - Chocolate
• \`${prefix}fruit\` - Fruta

🎮 *ANIMES/JOGOS:*
• \`${prefix}genshin_impact\` - Genshin Impact
• \`${prefix}naruto\` - Naruto
• \`${prefix}one_piece\` - One Piece
• \`${prefix}attack_on_titan\` - Attack on Titan
• \`${prefix}my_hero_academia\` - My Hero Academia
• \`${prefix}demon_slayer\` - Demon Slayer
• \`${prefix}spy_x_family\` - Spy x Family
• \`${prefix}jojo\` - JoJo
• \`${prefix}dragon_ball\` - Dragon Ball
• \`${prefix}bleach\` - Bleach
• \`${prefix}tokyo_revengers\` - Tokyo Revengers
• \`${prefix}original\` - Original

📌 *TOTAL: 89 comandos disponíveis*
💡 *Cada comando retorna 5 imagens aleatórias em carrossel!*

━━━━━━━━━━━━━━━
© NEEXT LTDA - ${nickDoDono}
`;
}

module.exports = {
    obterMenuPrincipal,
    obterMenuMembro,
    obterMenuAdmin,
    obterMenuAdm,
    obterMenuDono,
    obterMenuDownload,
    obterMenuGamer,
    obterMenuAnti,
    obterMenuRPG,
    obterMenuSticker,
    obterMenuFigurinhas,
    obterMenuBrincadeira,
    obterMenuHentai,
    obterMenuDonoAvancado,
    obterConfigurarBot,
    obterMenuRandom
};