const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // для сжатия фото

const logger = pino({ level: 'silent' });
const MY_NUMBER = '79283376737@s.whatsapp.net';

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_multi');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\nСКАНИРУЙ QR НИЖЕ\n');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(connectToWhatsApp, 5000);
        } else if (connection === 'open') {
            console.log('Подключено! Жду .одн');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();

        console.log(`Получено сообщение: "${text}" | fromMe: ${msg.key.fromMe} | sender: ${msg.key.participant || from}`);

        if (text !== '.одн' || !msg.key.fromMe) return;

        // Редактируем команду на точку вместо удаления (мгновенно)
        try {
            await sock.sendMessage(from, { text: '•', edit: msg.key });
            console.log('Сообщение изменено на точку');
        } catch (editErr) {
            console.error('Ошибка редактирования:', editErr);
            // Если не получилось — просто оставляем как есть
        }

        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(MY_NUMBER, { text: 'Нет quoted сообщения' });
            return;
        }

        console.log('Quoted keys:', Object.keys(quoted));

        let mediaMsg = quoted;
        if (quoted.viewOnceMessage) mediaMsg = quoted.viewOnceMessage.message || quoted;
        else if (quoted.viewOnceMessageV2) mediaMsg = quoted.viewOnceMessageV2.message || quoted;
        else if (quoted.viewOnceMessageV2Extension) mediaMsg = quoted.viewOnceMessageV2Extension.message || quoted;

        const type = Object.keys(mediaMsg)[0];
        console.log('Тип медиа:', type);

        if (!['imageMessage', 'videoMessage', 'audioMessage', 'ptvMessage'].includes(type)) {
            await sock.sendMessage(MY_NUMBER, { text: 'Не медиа в quoted' });
            return;
        }

        const msgMedia = mediaMsg[type];
        if (!msgMedia.directPath || !msgMedia.url || !msgMedia.mediaKey) {
            await sock.sendMessage(MY_NUMBER, { text: 'Медиа не скачивается (возможно уже открыто или stub)' });
            return;
        }

        try {
            let buffer = await downloadMediaMessage(
                { key: msg.key, message: quoted },
                'buffer',
                {},
                { logger, reuploadRequest: sock.updateMediaMessage }
            );

            let ext = type === 'videoMessage' || type === 'ptvMessage' ? 'mp4' : type === 'audioMessage' ? 'ogg' : 'jpg';
            const fileName = `viewonce_${new Date().toISOString().replace(/[:.T]/g, '-').slice(0, -5)}.${ext}`;
            const filePath = path.join('saved_viewonce', fileName);
            fs.mkdirSync('saved_viewonce', { recursive: true });

            // Сжимаем только фото, чтоб убрать ожидание
            if (type === 'imageMessage') {
                try {
                    buffer = await sharp(buffer)
                        .resize(1080, null, { withoutEnlargement: true }) // ширина макс 1080, высота пропорционально
                        .jpeg({ quality: 78, mozjpeg: true }) // 78% — отличный баланс качества/размера
                        .toBuffer();
                    ext = 'jpg'; // всегда jpg после сжатия
                } catch (sharpErr) {
                    console.log('Sharp сжатие не удалось:', sharpErr);
                    // если ошибка — отправляем оригинал
                }
            }

            fs.writeFileSync(filePath, buffer);
            console.log('Сохранено:', filePath);

            // Отправляем в ЛС
            let mediaObj = { caption: `Сохранено: ${fileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)` };

            if (type === 'imageMessage') {
                mediaObj.image = buffer;
            } else if (type === 'videoMessage' || type === 'ptvMessage') {
                // Если видео >8MB — отправляем как документ, чтоб не было "ожидания"
                if (buffer.length > 8 * 1024 * 1024) {
                    await sock.sendMessage(MY_NUMBER, {
                        document: buffer,
                        mimetype: msgMedia.mimetype,
                        fileName: fileName,
                        caption: `Видео большое (${(buffer.length / 1024 / 1024).toFixed(2)} MB), сохранено как документ`
                    });
                } else {
                    mediaObj.video = buffer;
                }
            } else if (type === 'audioMessage') {
                mediaObj.audio = buffer;
                mediaObj.ptt = true;
            }

            if (mediaObj.image || mediaObj.video || mediaObj.audio) {
                await sock.sendMessage(MY_NUMBER, mediaObj);
            }

            await sock.sendMessage(MY_NUMBER, { text: `Готово! Из чата ${from.replace('@s.whatsapp.net', '')}` });

        } catch (err) {
            console.error('Ошибка:', err);
            await sock.sendMessage(MY_NUMBER, { text: `Ошибка скачивания/отправки: ${err.message || 'пиздец неизвестный'}` });
        }
    });
}

connectToWhatsApp();
