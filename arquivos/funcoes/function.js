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

function logMensagem(m, text = "", isCommand = false) {
    const fromMe = m?.key?.fromMe || false;
    const jid = m?.key?.remoteJid || "";
    const isGroup = jid.endsWith("@g.us") || jid.endsWith("@lid");
    const sender = (m?.key?.participant || jid)?.split("@")[0] || "desconhecido";
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
    const remetente = `${pushName} (${sender})${fromMe ? " [EU]" : ""}`;

    const logText = `
───────────────────────────────
${tipo} ${local}
De: ${remetente}
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
        console.log(`📊 Comandos principais: ${totalPrincipais} | Hentai: ${totalHentai} | Total: ${total}`);
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