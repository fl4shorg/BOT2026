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
│ 𖧈∘̥⸽🎬⃟ menudownload
│ 𖧈∘̥⸽🖼️⃟ menufigurinhas
│ 𖧈∘̥⸽🔞⃟ menuhentai
│ 𖧈∘̥⸽🛠️⃟ menuadm
│ 𖧈∘̥⸽👑⃟ menudono
│ 𖧈∘̥⸽🧑‍🤝‍🧑⃟ menuMembro
│ 𖧈∘̥⸽🎮⃟ menuGamer
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
╭─━─━⋆｡°✩🦋✩°｡⋆ ━─━─╮
│     𝐌𝐄𝐍𝐔 𝐌𝐄𝐌𝐁𝐑𝐎 - 𝐍𝐄𝐄𝐗𝐓
╰─━─━⋆｡°✩🦋✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮

│╭─━─⋆｡°✩🤖✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}ping
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}hora
│╰─━─⋆｡°✩🤖✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩📝✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}rg
│╰─━─⋆｡°✩📝✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩📚✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}pensador [personagem]
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}frasesanime
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}wikipedia [assunto]
│╰─━─⋆｡°✩📚✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎲✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}chance [texto]
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}correio [número]/[mensagem]
│╰─━─⋆｡°✩🎲✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏷️✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}s
│┊𖥨ํ∘̥⃟⸽⃟🦋￫ ${prefix}rename [pack|author]
│╰─━─⋆｡°✩🏷️✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯
━━━━━━━━━━━━━━━
© NEEXT LTDA - Flash
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
    return `╭─━─━⋆｡°✩🎮✩°｡⋆ ━─━─╮
│       𝐌𝐄𝐍𝐔 𝐆𝐀𝐌𝐄𝐑
╰─━─━⋆｡°✩🎮✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮

│╭─━─⋆｡°✩🎯✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}jogodavelha @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}resetjogodavelha
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}roletarussa @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}disparar
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}resetroleta
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}jogodaforca
│╰─━─⋆｡°✩🎯✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🔮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}akinator
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}akinatorvoltar
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}akinatorparar
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ Responda com números 1-5
│╰─━─⋆｡°✩🔮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩♟️✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez @oponente
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez jogada e2e4
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez status
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez desistir
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez ranking
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez player [nome]
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}xadrez ajuda
│╰─━─⋆｡°✩♟️✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎉✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}eununca
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}impostor
│╰─━─⋆｡°✩🎉✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩💥✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}tapa @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}matar @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}atirar @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}atropelar @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}beijar @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}prender @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}sarra @user
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}dedo @user
│╰─━─⋆｡°✩💥✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩📊✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankcorno
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankgay
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}ranklesbica
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankburro
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankfeio
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankbonito
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankgostoso
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankgostosa
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankfumante
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankmaconheiro
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankpobre
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}ranksad
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankemo
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankcasal
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankotaku
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}ranknazista
│┊𖥨ํ∘̥⃟⸽⃟🎐￫ ${prefix}rankpau
│╰─━─⋆｡°✩📊✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯
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
╎║ な ⃟̸̷᪺͓͡🏮 ${prefix}antipagamento on/off - Anti-pagamento
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
╭─━─━⋆｡°✩🎮✩°｡⋆ ━─━─╮
│        𝐌𝐄𝐍𝐔 𝐑𝐏𝐆 - 𝐍𝐄𝐄𝐗𝐓𝐂𝐈𝐓𝐘
╰─━─━⋆｡°✩🎮✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮

│╭─━─⋆｡°✩📊✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}perfil
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}depositar [valor]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}sacar [valor]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}daily
│╰─━─⋆｡°✩📊✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩💼✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}trabalhos
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}escolhertrabalho [id]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}trabalhar
│╰─━─⋆｡°✩💼✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎓✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}educacao
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}estudar
│╰─━─⋆｡°✩🎓✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎣✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}pescar
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}minerar
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}coletar
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}cacar
│╰─━─⋆｡°✩🎣✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏪✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}loja
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}loja [categoria]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}comprar [item]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}inventario
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}vender [item]
│╰─━─⋆｡°✩🏪✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}tigrinho [valor]
│┊𖥨ํ∘̥⃟⸽⃟🪙￫ ${prefix}assaltar @user
│╰─━─⋆｡°✩🎮✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯
━━━━━━━━━━━━━━━
© NEEXT LTDA - Flash
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
• \`${prefix}take\` - Pega figurinha com seu nome
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
│┊𖥨ํ∘̥⃟⸽⃟💮￫ ${prefix}take - Pega figurinha com seu nome
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
    return `╭─━─━⋆｡°✩🎲✩°｡⋆ ━─━─╮
│ 𝐌𝐄𝐍𝐔 𝐑𝐀𝐍𝐃𝐎𝐌 
╰─━─━⋆｡°✩🎲✩°｡⋆ ━─━─╯
╎
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮

│╭─━─⋆｡°✩🎨✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}1girl — 1 garota
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}1boy — 1 garoto
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}2girls — 2 garotas
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}solo — Solo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}group — Grupo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}female — Feminino
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}male — Masculino
│╰─━─⋆｡°✩🎨✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩👤✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}long_hair — Cabelo longo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}short_hair — Cabelo curto
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}smile — Sorriso
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}blush — Corado
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}happy — Feliz
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}sad — Triste
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}angry — Bravo
│╰─━─⋆｡°✩👤✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩👗✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}cosplay — Cosplay
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}uniform — Uniforme
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}school_uniform — Uniforme escolar
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}maid — Empregada
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}nurse — Enfermeira
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}witch — Bruxa
│╰─━─⋆｡°✩👗✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩⚔️✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}armor — Armadura
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}sword — Espada
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}gun — Arma
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}magic — Magia
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}fantasy — Fantasia
│╰─━─⋆｡°✩⚔️✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩👻✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}vampire — Vampiro
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}demon — Demônio
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}angel — Anjo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}ghost — Fantasma
│╰─━─⋆｡°✩👻✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎃✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}halloween — Halloween
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}christmas — Natal
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}summer — Verão
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}beach — Praia
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}winter — Inverno
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}snow — Neve
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}autumn — Outono
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}rain — Chuva
│╰─━─⋆｡°✩🎃✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🌿✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}animal — Animal
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}flower — Flor
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}tree — Árvore
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}forest — Floresta
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}mountain — Montanha
│╰─━─⋆｡°✩🌿✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🌅✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}scenery — Cenário
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}city — Cidade
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}building — Prédio
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}street — Rua
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}night — Noite
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}sunset — Pôr do sol
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}sunrise — Nascer do sol
│╰─━─⋆｡°✩🌅✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩☁️✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}clouds — Nuvens
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}sky — Céu
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}moon — Lua
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}stars — Estrelas
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}river — Rio
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}lake — Lago
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}ocean — Oceano
│╰─━─⋆｡°✩☁️✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🚗✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}train — Trem
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}car — Carro
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}bike — Bicicleta
│╰─━─⋆｡°✩🚗✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🏫✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}school — Escola
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}classroom — Sala de aula
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}library — Biblioteca
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}room — Quarto
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}bed — Cama
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}chair — Cadeira
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}table — Mesa
│╰─━─⋆｡°✩🏫✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🍰✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}food — Comida
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}drink — Bebida
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}coffee — Café
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}tea — Chá
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}cake — Bolo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}chocolate — Chocolate
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}fruit — Fruta
│╰─━─⋆｡°✩🍰✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎮✩°｡⋆ ━─━╮
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}genshin_impact — Genshin Impact
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}naruto — Naruto
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}one_piece — One Piece
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}attack_on_titan — Attack on Titan
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}my_hero_academia — My Hero Academia
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}demon_slayer — Demon Slayer
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}spy_x_family — Spy x Family
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}jojo — JoJo
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}dragon_ball — Dragon Ball
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}bleach — Bleach
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}tokyo_revengers — Tokyo Revengers
│┊𖥨ํ∘̥⃟⸽⃟🪷￫ ${prefix}original — Original
│╰─━─⋆｡°✩🎮✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯`;
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