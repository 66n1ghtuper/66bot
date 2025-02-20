const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); 


const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID; 

const bot = new TelegramBot(token, { polling: true });

const userStates = {};


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

   
    const stickerId = 'CAACAgIAAxUAAWd9eyLLrsIKfNCmSnKvkdrM84ClAAJgAAPb234AAYYpTM5Q4efhNgQ'; 
    console.log(`Отправка стикера в чат ${chatId}`);
    
    bot.sendSticker(chatId, stickerId)
        .then(() => {
            console.log('Стикер отправлен успешно.');
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Заказчики', callback_data: 'Заказчики' }
                        ],
                        [
                            { text: 'Работодатели', callback_data: 'Работодатели' },
                            { text: 'Бизнес проекты', callback_data: 'Бизнес проекты' }
                        ],
                        [
                            { text: 'Поблагодарить', callback_data: 'thank_you' } 
                        ]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Здравствуйте, выберите категорию вашего предложения:', options);
        })
        .catch((error) => {
            console.error('Ошибка при отправке стикера:', error);
        });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const category = query.data;

    if (userStates[chatId] !== undefined) {
        bot.answerCallbackQuery(query.id, { text: 'Вы уже сделали выбор.', show_alert: true });
        return;
    }

    if (category === 'thank_you') {
        
        const thankYouStickerId = 'CAACAgIAAxkBAAIEDWeQxnFixWw7-_rm6QGHLJiBSrheAALsQQACqOq4SuoMKdjqIsgjNgQ'; 
        bot.sendSticker(chatId, thankYouStickerId)
            .then(() => {
                return bot.sendMessage(chatId, 'Если хотите поблагодарить, спросите у исполнителя данные карточки. Либо криптой, закинув USDT на кошелек по сети ETH:'); // Первое сообщение
            })
            .then(() => {
                return bot.sendMessage(chatId, '0xde5c191785bE7723cCf21BB1bfE593D5ca2B001A'); 
            })
            .catch((error) => {
                console.error('Ошибка при отправке:', error);
            });
    } else {
        userStates[chatId] = category; 
        bot.sendMessage(chatId, `Вы выбрали "${category}". Пожалуйста, напишите ваше сообщение:`);
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

  
    if (userStates[chatId]) {
        const category = userStates[chatId];
        const userName = msg.from.first_name || 'Пользователь';
        const userUsername = msg.from.username ? `(@${msg.from.username})` : '';
        const userMessage = msg.text;

        const responseMessage = `Новое сообщение от ${userName} ${userUsername}:\nКатегория: ${category}\nСообщение: ${userMessage}`;
        bot.sendMessage(adminChatId, responseMessage);

        
        delete userStates[chatId];
        bot.sendMessage(chatId, 'Спасибо! Ваше сообщение отправлено.В ближайшее время с вами свяжуться.');
    }
});

console.log('Бот запущен и ожидает сообщений...');





