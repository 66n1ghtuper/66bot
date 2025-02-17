const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Загружаем переменные окружения из .env

// Получаем токен и ID админа из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID; // Читаем ID из .env

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Объект для хранения состояния пользователей
const userStates = {};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Отправляем стикер
    const stickerId = 'CAACAgIAAxUAAWd9eyLLrsIKfNCmSnKvkdrM84ClAAJgAAPb234AAYYpTM5Q4efhNgQ'; // Замените на ID или URL вашего стикера
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
                            { text: 'Поблагодарить', callback_data: 'thank_you' } // Кнопка "Поблагодарить"
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

// Обработка нажатий на кнопки
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const category = query.data;

    // Проверяем, было ли уже обработано это нажатие
    if (userStates[chatId] !== undefined) {
        bot.answerCallbackQuery(query.id, { text: 'Вы уже сделали выбор.', show_alert: true });
        return;
    }

    if (category === 'thank_you') {
        // Отправляем стикер и два сообщения в заданной последовательности
        const thankYouStickerId = 'CAACAgIAAxkBAAIEDWeQxnFixWw7-_rm6QGHLJiBSrheAALsQQACqOq4SuoMKdjqIsgjNgQ'; // Замените на ID или URL вашего стикера
        bot.sendSticker(chatId, thankYouStickerId)
            .then(() => {
                return bot.sendMessage(chatId, 'Если хотите поблагодарить, спросите у исполнителя данные карточки. Либо криптой, закинув USDT на кошелек по сети ETH:'); // Первое сообщение
            })
            .then(() => {
                return bot.sendMessage(chatId, '0xde5c191785bE7723cCf21BB1bfE593D5ca2B001A'); // Второе сообщение
            })
            .catch((error) => {
                console.error('Ошибка при отправке:', error);
            });
    } else {
        userStates[chatId] = category; // Сохраняем состояние
        bot.sendMessage(chatId, `Вы выбрали "${category}". Пожалуйста, напишите ваше сообщение:`);
    }
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Проверяем, есть ли состояние для этого пользователя
    if (userStates[chatId]) {
        const category = userStates[chatId];
        const userName = msg.from.first_name || 'Пользователь';
        const userUsername = msg.from.username ? `(@${msg.from.username})` : '';
        const userMessage = msg.text;

        // Отправляем сообщение администратору
        const responseMessage = `Новое сообщение от ${userName} ${userUsername}:\nКатегория: ${category}\nСообщение: ${userMessage}`;
        bot.sendMessage(adminChatId, responseMessage);

        // Сбрасываем состояние
        delete userStates[chatId];
        bot.sendMessage(chatId, 'Спасибо! Ваше сообщение отправлено.В ближайшее время с вами свяжуться.');
    }
});

console.log('Бот запущен и ожидает сообщений...');