const { Telegraf } = require('telegraf');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN_HERE'); // замени на свой TOKEN от @BotFather
const logger = pino({ level: 'silent' });

const activeSessions = new Map(); // userIdTg → { sock, phone }
const pairingLimits = new Map(); // userIdTg → lastPairTime (для лимита 1 раз в день)

bot.start((ctx) => ctx.reply('Привет! Отправь /pair +79991234567 для подключения твоего WhatsApp. После подключения отвечай .одн на view-once в WA, и медиа придёт сюда.'));

bot.command('pair', async (ctx) => {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ').slice(1).join(' ').trim();

    if (!args.match(/^\+?\d{10,15}$/)) {
        return ctx.reply('Номер в формате +79991234567');
    }

    let phone = args.replace(/\D/g, '');
    if (phone.startsWith('8')) phone = '7' + phone.slice(1);

    // Лимит на подключения (1 в 24 часа)
    const lastTime = pairingLimits.get(userId) || 0;
    if (Date.now() - lastTime < 24 * 60 * 60 * 1000) {
        return ctx.reply('Лимит: одно подключение в день. Подожди.');
    }
    pairingLimits.set(userId, Date.now());

    // Папка сессии уникальная для пользователя
    const authFolder = `./auth_${userId}`;
    fs.mkdirSync(authFolder, { recursive: true });

    if (activeSessions.has(userId)) {
        return ctx.reply('У тебя уже сессия активна. /logout для выхода.');
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);

        const sock = makeWASocket({
            logger,
            printQRInTerminal: false,
            auth: state,
            syncFullHistory: false,
            markOnlineOnConnect: true
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                ctx.reply('Подключено к твоему WhatsApp! Теперь отвечай .одн на view-once медиа.');
                activeSessions.set(userId, { sock, phone });
            }
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode !== DisconnectReason.loggedOut) {
                    // переподключение
                    connectToWhatsApp(); // рекурсия для переподключения
                } else {
                    ctx.reply('Сессия завершена. /pair заново.');
                    activeSessions.delete(userId);
                }
            }
        });

        // Запрашиваем код
        const pairingCode = await sock.requestPairingCode(phone);
        ctx.reply(`Введи код в WhatsApp (Linked Devices → Link with phone number):\n\n**${pairingCode}**\n\nКод живёт 1 минуту.`);

    } catch (err) {
        ctx.reply(`Ошибка: ${err.message}`);
        console.error(err);
    }
});

// Обработчик logout
bot.command('logout', (ctx) => {
    const userId = ctx.from.id;
    if (activeSessions.has(userId)) {
        activeSessions.get(userId).sock.logout();
        activeSessions.delete(userId);
        // Удаляем сессию
        fs.rmSync(`./auth_${userId}`, { recursive: true, force: true });
        ctx.reply('Выход выполнен. Сессия удалена.');
    } else {
        ctx.reply('Нет активной сессии.');
    }
});

// Запуск бота
bot.launch();
console.log('Telegram бот запущен. Жди пользователей.');

// Для обработки .одн — это в sock.ev.on('messages.upsert') внутри makeWASocket, но для каждого sock отдельно (см. в pair)
