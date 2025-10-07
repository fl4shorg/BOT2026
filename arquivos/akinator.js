const { Akinator, AkinatorAnswer } = require("@aqul/akinator-api");

const jogosAtivos = new Map();

function getAkinatorAnswer(numero) {
    switch(numero) {
        case 1: return AkinatorAnswer.Yes;
        case 2: return AkinatorAnswer.No;
        case 3: return AkinatorAnswer.DontKnow;
        case 4: return AkinatorAnswer.Probably;
        case 5: return AkinatorAnswer.ProbablyNot;
        default: return null;
    }
}

function getAnswerText(numero) {
    switch(numero) {
        case 1: return "✅ Sim";
        case 2: return "❌ Não";
        case 3: return "❓ Não sei";
        case 4: return "🤔 Provavelmente";
        case 5: return "🤷 Provavelmente não";
        default: return "";
    }
}

async function iniciarAkinator(chatId, region = "pt") {
    try {
        if (jogosAtivos.has(chatId)) {
            return {
                success: false,
                message: "⚠️ Você já tem um jogo ativo! Use .akinatorparar para encerrar o jogo atual."
            };
        }

        const api = new Akinator({ region, childMode: true });
        await api.start();

        jogosAtivos.set(chatId, {
            api,
            region,
            iniciado: Date.now()
        });

        return {
            success: true,
            question: api.question,
            progress: api.progress,
            message: formatarPergunta(api.question, api.progress)
        };
    } catch (error) {
        console.error("❌ Erro ao iniciar Akinator:", error);
        return {
            success: false,
            message: "❌ Erro ao iniciar o Akinator. Tente novamente mais tarde."
        };
    }
}

async function responderAkinator(chatId, resposta) {
    try {
        const jogo = jogosAtivos.get(chatId);
        
        if (!jogo) {
            return {
                success: false,
                message: "⚠️ Você não tem um jogo ativo! Use .akinator para começar."
            };
        }

        const respostaNum = parseInt(resposta);
        if (isNaN(respostaNum) || respostaNum < 1 || respostaNum > 5) {
            return {
                success: false,
                message: "⚠️ Resposta inválida! Use:\n1 - Sim\n2 - Não\n3 - Não sei\n4 - Provavelmente\n5 - Provavelmente não"
            };
        }

        const akinatorAnswer = getAkinatorAnswer(respostaNum);
        const answerText = getAnswerText(respostaNum);
        
        await jogo.api.answer(akinatorAnswer);

        if (jogo.api.isWin) {
            jogosAtivos.delete(chatId);
            return {
                success: true,
                isWin: true,
                name: jogo.api.sugestion_name,
                description: jogo.api.sugestion_desc,
                photo: jogo.api.sugestion_photo,
                message: formatarVitoria(jogo.api.sugestion_name, jogo.api.sugestion_desc, jogo.api.sugestion_photo)
            };
        }

        return {
            success: true,
            isWin: false,
            question: jogo.api.question,
            progress: jogo.api.progress,
            lastAnswer: answerText,
            message: `${answerText}\n\n` + formatarPergunta(jogo.api.question, jogo.api.progress)
        };
    } catch (error) {
        console.error("❌ Erro ao responder Akinator:", error);
        jogosAtivos.delete(chatId);
        return {
            success: false,
            message: "❌ Erro ao processar resposta. O jogo foi encerrado."
        };
    }
}

async function voltarAkinator(chatId) {
    try {
        const jogo = jogosAtivos.get(chatId);
        
        if (!jogo) {
            return {
                success: false,
                message: "⚠️ Você não tem um jogo ativo! Use .akinator para começar."
            };
        }

        await jogo.api.cancelAnswer();

        return {
            success: true,
            question: jogo.api.question,
            progress: jogo.api.progress,
            message: `⬅️ Voltando...\n\n` + formatarPergunta(jogo.api.question, jogo.api.progress)
        };
    } catch (error) {
        console.error("❌ Erro ao voltar no Akinator:", error);
        return {
            success: false,
            message: "❌ Não foi possível voltar. Você pode estar na primeira pergunta."
        };
    }
}

function pararAkinator(chatId) {
    const jogo = jogosAtivos.get(chatId);
    
    if (!jogo) {
        return {
            success: false,
            message: "⚠️ Você não tem um jogo ativo!"
        };
    }

    const tempo = Math.floor((Date.now() - jogo.iniciado) / 1000);
    jogosAtivos.delete(chatId);

    return {
        success: true,
        message: `🛑 *Jogo encerrado!*\n\n⏱️ Tempo de jogo: ${tempo}s\n📊 Progresso: ${jogo.api.progress}%\n\n💡 Use .akinator para jogar novamente!`
    };
}

function formatarPergunta(question, progress) {
    const barraProgresso = gerarBarraProgresso(progress);
    
    return `🔮 *AKINATOR*

📊 Progresso: ${progress}%
${barraProgresso}

❓ *${question}*

┏━━━━━━━━━━━━━━━━━┓
┃ 1️⃣ Sim
┃ 2️⃣ Não
┃ 3️⃣ Não sei
┃ 4️⃣ Provavelmente
┃ 5️⃣ Provavelmente não
┗━━━━━━━━━━━━━━━━━┛

💡 Digite o número da sua resposta
⬅️ .akinatorvoltar - Voltar pergunta
🛑 .akinatorparar - Encerrar jogo`;
}

function formatarVitoria(name, description, photo) {
    return `🎉 *AKINATOR VENCEU!*

🎯 *Eu pensei em:*
👤 *${name}*

📝 *Descrição:*
${description || "Sem descrição"}

✨ *Eu acertei?*
🔮 Use .akinator para jogar novamente!`;
}

function gerarBarraProgresso(progress) {
    const total = 20;
    const preenchido = Math.floor(progress / 5);
    const vazio = total - preenchido;
    
    return `[${"█".repeat(preenchido)}${"░".repeat(vazio)}]`;
}

function statusAkinator(chatId) {
    const jogo = jogosAtivos.get(chatId);
    
    if (!jogo) {
        return {
            success: false,
            message: "⚠️ Você não tem um jogo ativo! Use .akinator para começar."
        };
    }

    const tempo = Math.floor((Date.now() - jogo.iniciado) / 1000);
    
    return {
        success: true,
        message: `📊 *STATUS DO JOGO*

⏱️ Tempo: ${tempo}s
📈 Progresso: ${jogo.api.progress}%
🌍 Região: ${jogo.region}

❓ *Pergunta atual:*
${jogo.api.question}

💡 Digite 1-5 para responder!`
    };
}

module.exports = {
    iniciarAkinator,
    responderAkinator,
    voltarAkinator,
    pararAkinator,
    statusAkinator,
    jogosAtivos
};
