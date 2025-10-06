const axios = require('axios');

const HENTAI_COMMANDS = {
    'hentai': 'https://www.api.neext.online/danbooru/hentai',
    'yaoi': 'https://www.api.neext.online/danbooru/yaoi',
    'yuri': 'https://www.api.neext.online/danbooru/yuri',
    'bondage': 'https://www.api.neext.online/danbooru/bondage',
    'nude': 'https://www.api.neext.online/danbooru/nude',
    'sex': 'https://www.api.neext.online/danbooru/sex',
    'anal': 'https://www.api.neext.online/danbooru/anal',
    'oral': 'https://www.api.neext.online/danbooru/oral',
    'futa': 'https://www.api.neext.online/danbooru/futa',
    'femdom': 'https://www.api.neext.online/danbooru/femdom',
    'cum': 'https://www.api.neext.online/danbooru/cum',
    'blowjob': 'https://www.api.neext.online/danbooru/blowjob',
    'handjob': 'https://www.api.neext.online/danbooru/handjob',
    'footjob': 'https://www.api.neext.online/danbooru/footjob',
    'panties': 'https://www.api.neext.online/danbooru/panties',
    'bra': 'https://www.api.neext.online/danbooru/bra',
    'lingerie': 'https://www.api.neext.online/danbooru/lingerie',
    'swimsuit': 'https://www.api.neext.online/danbooru/swimsuit',
    'bikini': 'https://www.api.neext.online/danbooru/bikini',
    'dress': 'https://www.api.neext.online/danbooru/dress',
    'skirt': 'https://www.api.neext.online/danbooru/skirt',
    'shirt': 'https://www.api.neext.online/danbooru/shirt',
    'coat': 'https://www.api.neext.online/danbooru/coat',
    'jacket': 'https://www.api.neext.online/danbooru/jacket',
    'glasses': 'https://www.api.neext.online/danbooru/glasses',
    'hat': 'https://www.api.neext.online/danbooru/hat',
    'ribbon': 'https://www.api.neext.online/danbooru/ribbon',
    'necklace': 'https://www.api.neext.online/danbooru/necklace',
    'breasts': 'https://www.api.neext.online/danbooru/breasts',
    'nipples': 'https://www.api.neext.online/danbooru/nipples',
    'ass': 'https://www.api.neext.online/danbooru/ass',
    'thighs': 'https://www.api.neext.online/danbooru/thighs',
    'pussy': 'https://www.api.neext.online/danbooru/pussy',
    'vaginal': 'https://www.api.neext.online/danbooru/vaginal',
    'cumshot': 'https://www.api.neext.online/danbooru/cumshot',
    'masturbation': 'https://www.api.neext.online/danbooru/masturbation',
    'lactation': 'https://www.api.neext.online/danbooru/lactation',
    'oral_sex': 'https://www.api.neext.online/danbooru/oral_sex',
    'sex_toy': 'https://www.api.neext.online/danbooru/sex_toy',
    'fisting': 'https://www.api.neext.online/danbooru/fisting',
    'double_penetration': 'https://www.api.neext.online/danbooru/double_penetration',
    'group_sex': 'https://www.api.neext.online/danbooru/group_sex',
    'bdsm': 'https://www.api.neext.online/danbooru/bdsm',
    'tanlines': 'https://www.api.neext.online/danbooru/tanlines',
    'nip_slip': 'https://www.api.neext.online/danbooru/nip_slip',
    'bondage_solo': 'https://www.api.neext.online/danbooru/bondage_solo',
    'bondage_group': 'https://www.api.neext.online/danbooru/bondage_group',
    'dominant': 'https://www.api.neext.online/danbooru/dominant',
    'submissive': 'https://www.api.neext.online/danbooru/submissive',
    'massage': 'https://www.api.neext.online/danbooru/massage',
    'strip': 'https://www.api.neext.online/danbooru/strip',
    'naked_play': 'https://www.api.neext.online/danbooru/naked_play',
    'glasses_remove': 'https://www.api.neext.online/danbooru/glasses_remove',
    'shirt_lift': 'https://www.api.neext.online/danbooru/shirt_lift',
    'panties_pull': 'https://www.api.neext.online/danbooru/panties_pull',
    'stockings': 'https://www.api.neext.online/danbooru/stockings',
    'corset': 'https://www.api.neext.online/danbooru/corset',
    'gag': 'https://www.api.neext.online/danbooru/gag',
    'whip': 'https://www.api.neext.online/danbooru/whip',
    'handcuffs': 'https://www.api.neext.online/danbooru/handcuffs',
    'tentacle': 'https://www.api.neext.online/danbooru/tentacle',
    'anal_fisting': 'https://www.api.neext.online/danbooru/anal_fisting',
    'double_cumshot': 'https://www.api.neext.online/danbooru/double_cumshot',
    'face_sitting': 'https://www.api.neext.online/danbooru/face_sitting',
    'creampie': 'https://www.api.neext.online/danbooru/creampie',
    'orgy': 'https://www.api.neext.online/danbooru/orgy',
    'threesome': 'https://www.api.neext.online/danbooru/threesome',
    'foursome': 'https://www.api.neext.online/danbooru/foursome',
    'group_play': 'https://www.api.neext.online/danbooru/group_play',
    'teacher_student': 'https://www.api.neext.online/danbooru/teacher_student',
    'maid_nsfw': 'https://www.api.neext.online/danbooru/maid_nsfw',
    'school_uniform_nsfw': 'https://www.api.neext.online/danbooru/school_uniform_nsfw',
    'swimsuit_nsfw': 'https://www.api.neext.online/danbooru/swimsuit_nsfw',
    'bikini_nsfw': 'https://www.api.neext.online/danbooru/bikini_nsfw',
    'yuri_anal': 'https://www.api.neext.online/danbooru/yuri_anal',
    'yaoi_anal': 'https://www.api.neext.online/danbooru/yaoi_anal',
    'futa_anal': 'https://www.api.neext.online/danbooru/futa_anal'
};

async function fetchHentaiImage(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        
        if (response.data) {
            return {
                success: true,
                imageBuffer: Buffer.from(response.data)
            };
        }
        
        return {
            success: false,
            error: 'Imagem não encontrada na resposta'
        };
    } catch (error) {
        console.error('Erro ao buscar imagem hentai:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function handleHentaiCommand(sock, command, from, sender, message) {
    const apiUrl = HENTAI_COMMANDS[command];
    
    if (!apiUrl) {
        return false;
    }

    const isGroup = from.endsWith('@g.us') || from.endsWith('@lid');
    
    if (isGroup) {
        await sock.sendMessage(from, {
            text: `🔞 *Conteúdo NSFW solicitado!*\n\n📬 Enviando imagem no seu privado para manter a discrição do grupo...\n\n⏳ Aguarde alguns segundos!`
        }, { quoted: message });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const targetJid = sender;
        const result = await fetchHentaiImage(apiUrl);
        
        if (result.success) {
            await sock.sendMessage(targetJid, {
                image: result.imageBuffer,
                caption: `🔞 *${command.toUpperCase()}*\n\n📸 Imagem aleatória da API Neext\n🌐 api.neext.online\n\n⚠️ Conteúdo +18`
            });
            console.log(`🔞 Imagem ${command} enviada no PV de ${sender.split('@')[0]}`);
        } else {
            await sock.sendMessage(targetJid, {
                text: `❌ Erro ao buscar imagem: ${result.error}`
            });
        }
    } else {
        const result = await fetchHentaiImage(apiUrl);
        
        if (result.success) {
            await sock.sendMessage(from, {
                image: result.imageBuffer,
                caption: `🔞 *${command.toUpperCase()}*\n\n📸 Imagem aleatória da API Neext\n🌐 api.neext.online\n\n⚠️ Conteúdo +18`
            }, { quoted: message });
            console.log(`🔞 Imagem ${command} enviada no PV de ${sender.split('@')[0]}`);
        } else {
            await sock.sendMessage(from, {
                text: `❌ Erro ao buscar imagem: ${result.error}`
            }, { quoted: message });
        }
    }
    
    return true;
}

function isHentaiCommand(command) {
    return HENTAI_COMMANDS.hasOwnProperty(command);
}

module.exports = {
    handleHentaiCommand,
    isHentaiCommand,
    HENTAI_COMMANDS
};