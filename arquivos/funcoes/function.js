// ---------------------------
// Pacotes
// ---------------------------
const cfonts = require("cfonts");

// ---------------------------
// Configurações do Bot
// ---------------------------
const settings = require("../../settings/settings.json");
const prefix = settings.prefix || ".";
const botNome = settings.nomeDoBot || "NEEXT BOT";

// ---------------------------
// Banner do bot
// ---------------------------
function mostrarBanner() {
    console.clear();

    // NEEXT em roxo sólido
    cfonts.say("NEEXT", {
        font: "block",
        align: "center",
        colors: ["#800080"], // roxo real
        background: "transparent",
        letterSpacing: 1,
        space: true
    });

    // LTDA em roxo sólido
    cfonts.say("LTDA", {
        font: "block",
        align: "center",
        colors: ["#800080"], // roxo real
        background: "transparent",
        letterSpacing: 1,
        space: true
    });

    console.log("\n");
}

// ---------------------------
// Logs simples (sem duplicação e sem criar arquivos)
// ---------------------------
const mensagensRegistradas = new Set();

// Helper para tentar resolver o número de telefone a partir do JID/LID
function resolverNumero(jidCompleto, sock) {
    try {
        if (!jidCompleto || !sock) return null;
        
        // Método 1: Tenta usar decodeJid (Baileys mantém mapeamento LID→WID)
        const decoded = sock.decodeJid ? sock.decodeJid(jidCompleto) : jidCompleto;
        
        // Se temos um número normal (não é LID), extrai ele
        if (decoded && !decoded.includes(':lid')) {
            const numero = decoded.split('@')[0];
            // Verifica se é um número válido (não é grupo, status, etc)
            if (numero && /^\d+$/.test(numero)) {
                return numero;
            }
        }
        
        // Método 2: Busca no mapeamento do authState (lidJidMapping)
        if (sock.authState?.creds?.lidJidMapping?.lidToWid) {
            const mapping = sock.authState.creds.lidJidMapping.lidToWid;
            const wid = mapping[jidCompleto];
            if (wid) {
                const numero = wid.split('@')[0];
                if (numero && /^\d+$/.test(numero)) {
                    return numero;
                }
            }
        }
        
        // Método 3: Busca no store de contatos do Baileys
        if (sock.store?.contacts?.[jidCompleto]) {
            const contact = sock.store.contacts[jidCompleto];
            if (contact.id) {
                const numero = contact.id.split('@')[0].split(':')[0];
                if (numero && /^\d+$/.test(numero)) {
                    return numero;
                }
            }
        }
        
        // Método 4: Extrai o LID e tenta buscar mapeamento reverso
        if (jidCompleto.includes('@lid')) {
            const lidNumero = jidCompleto.split('@')[0].split(':')[0];
            
            // Tenta buscar no mapeamento reverso
            if (sock.authState?.creds?.lidJidMapping?.widToLid) {
                const mappingReverso = sock.authState.creds.lidJidMapping.widToLid;
                for (const [wid, lid] of Object.entries(mappingReverso)) {
                    if (lid === jidCompleto) {
                        const numero = wid.split('@')[0];
                        if (numero && /^\d+$/.test(numero)) {
                            return numero;
                        }
                    }
                }
            }
            
            // Se o LID tem número, tenta extrair diretamente
            if (lidNumero && /^\d+$/.test(lidNumero)) {
                return lidNumero;
            }
        }
        
        return null;
    } catch (err) {
        console.error('❌ Erro ao resolver número:', err.message);
        return null;
    }
}

function logMensagem(m, text = "", isCommand = false, sock = null) {
    const fromMe = m?.key?.fromMe || false;
    const jid = m?.key?.remoteJid || "";
    const isGroup = jid.endsWith("@g.us") || jid.endsWith("@lid");
    const senderJid = m?.key?.participant || jid;
    const sender = senderJid?.split("@")[0] || "desconhecido";
    const pushName = m?.pushName || "Sem nome";

    const conteudo = text || (() => {
        if (m?.message?.conversation) return m.message.conversation;
        if (m?.message?.extendedTextMessage?.text) return m.message.extendedTextMessage.text;
        if (m?.message?.imageMessage?.caption) return m.message.imageMessage.caption;
        if (m?.message?.videoMessage?.caption) return m.message.videoMessage.caption;
        return "[conteúdo não suportado]";
    })();

    // Evita duplicação
    const logKey = `${fromMe}-${jid}-${conteudo}`;
    if (mensagensRegistradas.has(logKey)) return;
    mensagensRegistradas.add(logKey);

    const tipo = isCommand || (conteudo.startsWith(prefix)) ? "[COMANDO]" : "[MENSAGEM]";
    const local = isGroup ? "GRUPO" : "PV";
    
    // Detecta se é LID ou número tradicional
    const isLid = senderJid && senderJid.includes('@lid');
    const isTradicional = senderJid && senderJid.includes('@s.whatsapp.net');
    
    let infoRemetente = pushName;
    
    // Se for LID, tenta resolver o número E mostra o LID
    if (isLid) {
        const numero = resolverNumero(senderJid, sock);
        const lid = senderJid.split('@')[0];
        if (numero) {
            infoRemetente = `${pushName} (📞 ${numero} | 🆔 LID: ${lid})`;
        } else {
            infoRemetente = `${pushName} (🆔 LID: ${lid})`;
        }
    }
    // Se for tradicional, mostra o número direto
    else if (isTradicional) {
        const numero = senderJid.split('@')[0];
        infoRemetente = `${pushName} (📞 ${numero})`;
    }
    // Fallback genérico
    else {
        const id = senderJid ? senderJid.split('@')[0] : "desconhecido";
        infoRemetente = `${pushName} (ID: ${id})`;
    }
    
    if (fromMe) infoRemetente += " [EU]";

    const logText = `
───────────────────────────────
${tipo} ${local}
De: ${infoRemetente}
${isGroup ? `📍 Grupo ID: ${jid.split('@')[0]}` : ''}
${isGroup && senderJid ? `👤 Sender: ${senderJid}` : ''}
${!isGroup ? `👤 RemoteJid: ${jid}` : ''}
Conteúdo: ${conteudo}
───────────────────────────────`;

    console.log(logText);
}

// ---------------------------
// Função para buscar buffer de URL
// ---------------------------
async function getBuffer(url) {
    try {
        const response = await require('axios').get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Erro ao buscar buffer da URL:', error);
        throw error;
    }
}

// Função para formatar JID
function formatJid(jid) {
    return String(jid || "").replace(/@s\.whatsapp\.net|@g\.us|@lid/g,'');
}

// ---------------------------
// Função para saudação baseada no horário
// ---------------------------
function obterSaudacao() {
    const moment = require('moment-timezone');
    const hora = moment().tz('America/Sao_Paulo').hour();
    
    if (hora >= 6 && hora < 12) {
        return "🌅 Bom dia";
    } else if (hora >= 12 && hora < 18) {
        return "☀️ Boa tarde";
    } else if (hora >= 18 && hora < 24) {
        return "🌙 Boa noite";
    } else {
        return "🌃 Boa madrugada";
    }
}

// ---------------------------
// Função para contar grupos
// ---------------------------
async function contarGrupos(sock) {
    try {
        const grupos = await sock.groupFetchAllParticipating();
        return Object.keys(grupos).length;
    } catch (error) {
        console.error('Erro ao contar grupos:', error);
        return 0;
    }
}

// ---------------------------
// Função para contar comandos automaticamente
// ---------------------------
function contarComandos() {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Lê o arquivo index.js
        const indexPath = path.join(__dirname, '../../index.js');
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Procura pelo switch principal até default
        const lines = indexContent.split('\n');
        const comandosPrincipais = new Set();
        
        let inSwitch = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detecta o switch (command) {
            if (line.match(/^\s*switch\s*\(\s*command\s*\)\s*{/)) {
                inSwitch = true;
                continue;
            }
            
            // Se estamos dentro do switch
            if (inSwitch) {
                // Procura cases com exatamente 8 espaços no início (primeiro nível)
                const caseMatch = line.match(/^        case "([^"]+)"/);
                if (caseMatch) {
                    comandosPrincipais.add(caseMatch[1]);
                }
                
                // Detecta default (fim do switch)
                if (line.match(/^        default:/)) {
                    inSwitch = false;
                    break;
                }
            }
        }
        
        // Conta comandos principais
        const totalPrincipais = comandosPrincipais.size;
        
        // Adiciona os comandos hentai
        let totalHentai = 0;
        try {
            const hentaiPath = path.join(__dirname, '../hentai.js');
            const hentai = require(hentaiPath);
            const comandosHentai = Object.keys(hentai.HENTAI_COMMANDS || {});
            totalHentai = comandosHentai.length;
            comandosHentai.forEach(cmd => comandosPrincipais.add(cmd));
        } catch (err) {
            console.log('⚠️ Não foi possível carregar comandos hentai:', err.message);
        }
        
        const total = comandosPrincipais.size;
        // console.log(`📊 Comandos principais: ${totalPrincipais} | Hentai: ${totalHentai} | Total: ${total}`);
        return total;
    } catch (error) {
        console.error('❌ Erro ao contar comandos automaticamente:', error);
        // Fallback para contagem manual se houver erro
        return 246;
    }
}

// ---------------------------
// Exportações
// ---------------------------
module.exports = {
    mostrarBanner,
    logMensagem,
    formatJid,
    getBuffer,
    obterSaudacao,
    contarGrupos,
    contarComandos
};