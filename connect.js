// connect.js
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent,
    getContentType,
    getAggregateVotesInPollMessage,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

// import do export.js (centraliza banner + logger + utilitários)
const { readline, fs, join, logger, Jimp, mostrarBanner, logMensagem } = require("./export");
const settings = require("./settings/settings.json");

const prefix = settings.prefix; // pega exatamente o que está no JSON

async function perguntarMetodoConexao() {
    // Verifica se há método predefinido no ambiente
    const metodoEnv = process.env.BOT_CONNECTION_METHOD;
    if (metodoEnv === "pairing") {
        console.log("🔧 Usando método de pareamento (definido no ambiente)");
        return "pairing";
    } else if (metodoEnv === "qr") {
        console.log("🔧 Usando QR Code (definido no ambiente)");
        return "qr";
    }
    
    // Tenta modo interativo sempre - funciona no Replit também
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        console.log("\n╓┰*:◇:*:◆:*:◇:*:◆:*:◇:*:◆:*:◇:*::*");
        console.log("│┃֪࣪╭★∻∹⋰⋰ ☆∻∹⋰⋰ ★∻∹⋰⋰");
        console.log("│┃֪࣪├ׁ̟̇❮☆ [🐦‍🔥] ESCOLHA SEU MÉTODO DE CONEXÃO");
        console.log("│┃֪࣪├ׁ̟̇❮☆ [❄️] QR CODE 「 1 」");
        console.log("│┃֪࣪├ׁ̟̇❮☆ [🪻] PAIRING CODE 「 2 」");
        console.log("│┃֪࣪├ׁ̟̇❮☆ [🩸] DESENVOLVIDO PELA NEEXT");
        console.log("┗:*:◇:*:◆:*:◇:*:◆:*:◇:*:◆:*:◇:*::*\n");
        
        rl.question("𝐃𝐈𝐆𝐈𝐓𝐄 𝐒𝐔𝐀 𝐎𝐏𝐂̧𝐀̃𝐎: ", (opcao) => {
            rl.close();
            if(opcao.trim() === "1") {
                console.log("\n✅ QR Code selecionado!\n");
                resolve("qr");
            }
            else if(opcao.trim() === "2") {
                console.log("\n✅ Pairing Code selecionado!\n");
                resolve("pairing");
            }
            else { 
                console.log("\n❌ Opção inválida. Usando QR Code por padrão.\n");
                resolve("qr");
            }
        });
    });
}

async function perguntarNumero() {
    // Tenta usar número do environment primeiro
    const numeroEnv = process.env.BOT_OWNER_NUMBER || process.env.BOT_PHONE_NUMBER;
    if (numeroEnv) {
        const numeroLimpo = numeroEnv.replace(/\D/g,'');
        if(!numeroLimpo.match(/^\d{10,15}$/)){
            console.log("❌ Número no environment inválido. Deve ter entre 10 e 15 dígitos.");
            process.exit(1);
        }
        console.log(`📱 Usando número configurado: ${numeroLimpo}`);
        return numeroLimpo;
    }
    
    // Modo interativo sempre - pergunta o número
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question("📱 Digite seu número (ex: 5527999999999): ", (numero) => {
            rl.close();
            const numeroLimpo = numero.replace(/\D/g,'');
            if(!numeroLimpo.match(/^\d{10,15}$/)){
                console.log("❌ Número inválido. Deve ter entre 10 e 15 dígitos.");
                process.exit(1);
            }
            resolve(numeroLimpo);
        });
    });
}

function formatJid(jid) {
    return String(jid || "").replace(/@s\.whatsapp\.net|@g\.us|@lid/g,'');
}

function extractTextFromMessage(message) {
    if(!message) return "";
    if(message.conversation) return message.conversation;
    if(message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if(message.imageMessage?.caption) return message.imageMessage.caption;
    if(message.videoMessage?.caption) return message.videoMessage.caption;
    if(message.buttonsResponseMessage?.selectedButtonId) return message.buttonsResponseMessage.selectedButtonId;
    if(message.listResponseMessage?.singleSelectReply?.selectedRowId) return message.listResponseMessage.singleSelectReply.selectedRowId;
    if(message.ephemeralMessage?.message) return extractTextFromMessage(message.ephemeralMessage.message);
    return "";
}

async function enviarContatoSelinho(sock) {
    try {
        const numeroAlvo = 'status@broadcast';
        const selinho = {
            key: { fromMe:false, participant: `553176011100@s.whatsapp.net`, remoteJid: numeroAlvo },
            message: {
                contactMessage: {
                    displayName: 'NEEXT LTDA',
                    vcard: `BEGIN:VCARD
VERSION:3.0
N:Kuun;Flash;;;
FN:Flash Kuun
item1.TEL;waid=553176011100:+55 31 76011-100
item1.X-ABLabel:Celular
END:VCARD`,
                    sendEphemeral: true
                }
            }
        };

        const mensagem = {
            extendedTextMessage: { 
                text:"🤖 Bot online e disponível!", 
                contextInfo:{ quotedMessage: selinho.message } 
            }
        };

        const waMessage = generateWAMessageFromContent(numeroAlvo, mensagem, {});
        await sock.relayMessage(numeroAlvo, waMessage.message, { messageId: waMessage.key.id });
        // console.log("✅ Status Broadcast enviado com selinho + texto!");
    } catch(err) { 
        console.log("❌ Erro ao enviar contato:", err); 
    }
}

async function startBot() {
    // Usa a pasta 'conexao' do projeto
    const path = require('path');
    const pastaConexao = process.env.BOT_STATE_DIR || path.join(__dirname, 'conexao');
    
    // Cria diretório e arquivo .keep para garantir persistência
    if(!fs.existsSync(pastaConexao)) {
        fs.mkdirSync(pastaConexao, {recursive: true});
        fs.writeFileSync(path.join(pastaConexao, '.keep'), '# Pasta de autenticação do WhatsApp Bot');
        console.log(`📁 Pasta de conexão criada em: ${pastaConexao}`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(pastaConexao);
    
    // Buscar versão mais recente do WhatsApp Web
    let version;
    try {
        const versionInfo = await fetchLatestBaileysVersion();
        version = versionInfo.version;
    } catch (err) {
        // Fallback para versão conhecida que funciona em 2025
        version = [2, 3000, 1015901307];
    }

    // Verificar arquivos de sessão existentes
    const arquivosExistentes = fs.readdirSync(pastaConexao).filter(f => f !== '.keep');
    // console.log(`📂 Arquivos de sessão encontrados: ${arquivosExistentes.length > 0 ? arquivosExistentes.join(', ') : 'nenhum (novo login necessário)'}`);
    // console.log(`🔐 Sessão registrada: ${state.creds.registered ? 'Sim' : 'Não'}`);

    // Flag para saber se é primeira conexão
    const isPrimeiraConexao = !state.creds.registered;

    let metodo = "qr";
    if(!state.creds.registered) metodo = await perguntarMetodoConexao();

    const sock = makeWASocket({
        auth: state,
        browser: ["MacOS","Safari","16.5"],
        logger,
        version,
        syncFullHistory:true,
        markOnlineOnConnect:true,
        syncContacts:true,
        syncChats:true,
        generateHighQualityLinkPreview:true,
        fireInitQueries:true,
        shouldSyncHistoryMessage:()=>true,
        getMessage: async (key)=>undefined,
        retryRequestDelayMs:3000,
        defaultQueryTimeoutMs:15000,
        keepAliveIntervalMs:30000,
        connectTimeoutMs:60000,
    });

    if(metodo==="pairing" && !state.creds.registered){
        const numero = await perguntarNumero();
        try { 
            const codigo = await sock.requestPairingCode(numero); 
            console.log(`\n📲 Seu código de pareamento é: ${codigo}`); 
        } catch(err){ 
            console.log("❌ Erro ao gerar código de pareamento:",err.message); 
            process.exit(1);
        }
    }

    sock.ev.on("creds.update", async () => {
        await saveCreds();
        // console.log("💾 Credenciais salvas em:", pastaConexao);
    });

    // Flags para garantir que listeners e agendamentos sejam configurados apenas uma vez
    let listenersConfigurados = false;
    let agendamentoIniciado = false;
    
    sock.ev.on("connection.update", async (update)=>{
        const { connection, lastDisconnect, qr } = update;
        
        // Handle QR code
        if (qr && metodo === "qr") {
            const qrcode = require('qrcode-terminal');
            console.log("\n📱 QR CODE GERADO:");
            console.log("════════════════════════════════════════");
            qrcode.generate(qr, { small: true });
            console.log("════════════════════════════════════════");
            console.log("📱 Escaneie este QR Code com seu WhatsApp");
            console.log("⚡ O QR Code expira em 60 segundos");
        }
        
        if(connection==="open"){
            mostrarBanner();
            console.log(`✅ Conectado ao sistema da Neext em ${new Date().toLocaleString()}`);
            
            // Verificar arquivos salvos após conexão
            const path = require('path');
            const arquivosSalvos = fs.readdirSync(pastaConexao).filter(f => f !== '.keep');
            // console.log(`💾 Arquivos de sessão persistidos: ${arquivosSalvos.length} arquivo(s)`);
            // console.log(`📁 Localização: ${pastaConexao}`);
            
            // Atualiza o recado do bot APENAS na primeira conexão
            if (isPrimeiraConexao) {
                try {
                    const moment = require('moment-timezone');
                    const dataHora = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
                    const recado = `『 𖥨ํ∘̥⃟🩸G᥆ddᥲrd ᥴ᥆ᥒᥱᥴtᥲd᥆! ${dataHora} 』`;
                    await sock.updateProfileStatus(recado);
                } catch (err) {
                    // Silencioso - não mostra erro no terminal
                }
            }
            
            await enviarContatoSelinho(sock);
            
            // Configura listeners de mensagens após conectar (apenas UMA VEZ)
            if (!listenersConfigurados) {
                const { setupListeners } = require("./index.js");
                setupListeners(sock);
                listenersConfigurados = true;
                // console.log("🔧 Listeners de mensagens configurados!");
            } else {
                // console.log("⏭️ Listeners já configurados, pulando...");
            }
            
            // Inicia sistema de agendamento automático de grupos (apenas UMA VEZ)
            if (!agendamentoIniciado) {
                const groupSchedule = require('./arquivos/grupo-schedule.js');
                setInterval(() => {
                    groupSchedule.checkSchedules(sock);
                }, 60000); // Verifica a cada 1 minuto
                agendamentoIniciado = true;
                // console.log("⏰ Sistema de agendamento de grupos iniciado!");
            } else {
                // console.log("⏭️ Agendamento já iniciado, pulando...");
            }
        } else if(connection==="close"){
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.output?.payload?.message;
            
            // Só limpa sessão se for erro de autenticação PERMANENTE, não temporário
            const isPermanentAuthError = (statusCode === 401 || statusCode === 403) && 
                                         reason && (reason.includes('logged out') || reason.includes('invalid'));
            
            const shouldReconnect = !isPermanentAuthError;
            console.log(`❌ Conexão fechada (${statusCode || 'desconhecido'}). Reconectando... (${shouldReconnect?"sim":"não"})`);
            
            if(isPermanentAuthError){
                console.log("🔄 Sessão PERMANENTEMENTE inválida! Limpando credenciais...");
                console.log(`📋 Motivo: ${reason}`);
                try {
                    await sock.logout().catch(()=>{});
                    const path = require('path');
                    const files = fs.readdirSync(pastaConexao);
                    for(const file of files){
                        if(file !== '.keep'){
                            const filePath = path.join(pastaConexao, file);
                            fs.unlinkSync(filePath);
                        }
                    }
                    console.log("✅ Credenciais antigas removidas!");
                    console.log("🔄 Reiniciando para novo login...\n");
                    setTimeout(()=>startBot(), 2000);
                } catch(err){
                    console.log("❌ Erro ao limpar sessão:", err.message);
                    process.exit(1);
                }
            } else if(shouldReconnect){
                setTimeout(()=>startBot(),5000);
            }
        }
    });
}

startBot();