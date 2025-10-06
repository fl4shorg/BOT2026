const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const scheduleFile = path.join(__dirname, '../database/grupos/group_schedule.json');

function carregarSchedules() {
    try {
        if (!fs.existsSync(scheduleFile)) {
            fs.writeFileSync(scheduleFile, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(scheduleFile, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("❌ Erro ao carregar schedules:", err);
        return {};
    }
}

function salvarSchedules(schedules) {
    try {
        fs.writeFileSync(scheduleFile, JSON.stringify(schedules, null, 2));
        return true;
    } catch (err) {
        console.error("❌ Erro ao salvar schedules:", err);
        return false;
    }
}

function setSchedule(groupId, type, time) {
    const schedules = carregarSchedules();
    if (!schedules[groupId]) {
        schedules[groupId] = {};
    }
    schedules[groupId][type] = time;
    return salvarSchedules(schedules);
}

function getSchedule(groupId) {
    const schedules = carregarSchedules();
    return schedules[groupId] || {};
}

function removeSchedule(groupId, type) {
    const schedules = carregarSchedules();
    if (schedules[groupId] && schedules[groupId][type]) {
        delete schedules[groupId][type];
        if (Object.keys(schedules[groupId]).length === 0) {
            delete schedules[groupId];
        }
        return salvarSchedules(schedules);
    }
    return false;
}

function parseTime(timeStr) {
    const regex = /^(\d{1,2}):(\d{2})$/;
    const match = timeStr.match(regex);
    if (!match) return null;
    
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    
    return { hours, minutes, formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` };
}

async function checkSchedules(sock) {
    const schedules = carregarSchedules();
    const now = moment().tz('America/Sao_Paulo');
    const currentTime = `${now.hours().toString().padStart(2, '0')}:${now.minutes().toString().padStart(2, '0')}`;
    
    for (const [groupId, schedule] of Object.entries(schedules)) {
        if (schedule.open === currentTime) {
            try {
                await sock.groupSettingUpdate(groupId, 'not_announcement');
                await sock.sendMessage(groupId, {
                    text: `🔓 *GRUPO ABERTO AUTOMATICAMENTE*\n\n⏰ Horário programado: ${currentTime}\n✅ O grupo foi aberto como configurado!`
                });
                console.log(`🔓 Grupo ${groupId} aberto automaticamente às ${currentTime}`);
            } catch (err) {
                console.error(`❌ Erro ao abrir grupo ${groupId}:`, err);
            }
        }
        
        if (schedule.close === currentTime) {
            try {
                await sock.groupSettingUpdate(groupId, 'announcement');
                await sock.sendMessage(groupId, {
                    text: `🔒 *GRUPO FECHADO AUTOMATICAMENTE*\n\n⏰ Horário programado: ${currentTime}\n✅ O grupo foi fechado como configurado!`
                });
                console.log(`🔒 Grupo ${groupId} fechado automaticamente às ${currentTime}`);
            } catch (err) {
                console.error(`❌ Erro ao fechar grupo ${groupId}:`, err);
            }
        }
    }
}

module.exports = {
    setSchedule,
    getSchedule,
    removeSchedule,
    parseTime,
    checkSchedules
};