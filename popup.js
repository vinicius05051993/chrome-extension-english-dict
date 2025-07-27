const msgMultiLanguage = {
    'pt': {
        'loginAlert': 'Faça login no Google Chrome e ative a sincronização para que as palavras sejam armazenadas corretamente!',
        'chooseLanguage': 'Escolha sua Língua Nativa',
        'info-message': 'Atualize a página para usar a nova configuração!',
        'info-second-message': 'Palavras já marcadas não serão atualizadas automaticamente.',
        'training-link': 'Treinar palavras'
    },
    'en': {
        'loginAlert': 'Log in to Google Chrome and enable sync so that words are stored correctly!',
        'chooseLanguage': 'Choose your Native Language',
        'info-message': 'Refresh the page to use the new setting!',
        'info-second-message': 'Words already marked will not be updated automatically.',
        'training-link': 'Train words'
    },
    'zh': {
        'loginAlert': '登录 Google Chrome 并启用同步，以便正确存储单词！',
        'chooseLanguage': '选择您的母语',
        'info-message': '刷新页面以使用新设置！',
        'info-second-message': '已标记的单词不会自动更新。',
        'training-link': '训练单词'
    },
    'hi': {
        'loginAlert': 'शब्दों को सही ढंग से संग्रहीत करने के लिए Google Chrome में लॉग इन करें और सिंक चालू करें!',
        'chooseLanguage': 'अपनी मातृभाषा चुनें',
        'info-message': 'नई सेटिंग का उपयोग करने के लिए पेज को रीफ्रेश करें!',
        'info-second-message': 'पहले से चिह्नित शब्द स्वतः अपडेट नहीं होंगे।',
        'training-link': 'शब्दों का अभ्यास करें'
    },
    'es': {
        'loginAlert': '¡Inicia sesión en Google Chrome y activa la sincronización para que las palabras se almacenen correctamente!',
        'chooseLanguage': 'Elige tu idioma nativo',
        'info-message': '¡Actualiza la página para usar la nueva configuración!',
        'info-second-message': 'Las palabras ya marcadas no se actualizarán automáticamente.',
        'training-link': 'Entrenar palabras'
    },
    'fr': {
        'loginAlert': 'Connectez-vous à Google Chrome et activez la synchronisation afin que les mots soient stockés correctement !',
        'chooseLanguage': 'Choisissez votre langue maternelle',
        'info-message': 'Actualisez la page pour utiliser le nouveau paramètre !',
        'info-second-message': 'Les mots déjà marqués ne seront pas mis à jour automatiquement.',
        'training-link': 'Entraîner les mots'
    },
    'ar': {
        'loginAlert': 'قم بتسجيل الدخول إلى Google Chrome وقم بتمكين المزامنة حتى يتم تخزين الكلمات بشكل صحيح!',
        'chooseLanguage': 'اختر لغتك الأم',
        'info-message': 'قم بتحديث الصفحة لاستخدام الإعداد الجديد!',
        'info-second-message': 'لن يتم تحديث الكلمات التي تم تمييزها مسبقًا تلقائيًا.',
        'training-link': 'تدريب الكلمات'
    },
    'ru': {
        'loginAlert': 'Войдите в Google Chrome и включите синхронизацию, чтобы слова сохранялись правильно!',
        'chooseLanguage': 'Выберите родной язык',
        'info-message': 'Обновите страницу, чтобы использовать новый параметр!',
        'info-second-message': 'Ранее отмеченные слова не будут обновлены автоматически.',
        'training-link': 'Тренировать слова'
    }
};

let targetlanguage = 'pt';

function getTrainingLink(email) {
    return "https://vinicius05051993.github.io/chrome-extension-english-dict/?email=" + email;
}

document.addEventListener('DOMContentLoaded', function() {
    init().then(r => '');
    chrome.storage.sync.get('targetLanguage', function(data) {
        targetlanguage = data.targetLanguage || 'pt';
        document.getElementById('language-select').value = targetlanguage;

        document.getElementById('loginAlert').innerText = msgMultiLanguage[targetlanguage]['loginAlert'];
        document.getElementById('chooseLanguage').innerText = msgMultiLanguage[targetlanguage]['chooseLanguage'];
        document.getElementById('training-link').innerText = msgMultiLanguage[targetlanguage]['training-link'];
    });
});

chrome.identity.getProfileUserInfo(function(userInfo) {
    if (!userInfo.email) {
        document.getElementById('loginAlert').style.display = 'block';
    }
});

document.getElementById('language-select').addEventListener('change', function() {
    targetLanguage = this.value;
    chrome.storage.sync.set({ targetLanguage: this.value }, function() {});
    document.getElementById('loginAlert').innerText = msgMultiLanguage[this.value]['loginAlert'];
    document.getElementById('chooseLanguage').innerText = msgMultiLanguage[this.value]['chooseLanguage'];
    document.getElementById('info-message').innerText = msgMultiLanguage[this.value]['info-message'];
    document.getElementById('info-second-message').innerText = msgMultiLanguage[this.value]['info-second-message'];
    document.getElementById('training-link').innerText = msgMultiLanguage[this.value]['training-link'];
});

let currentUser;

async function getSecureKey(keyName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: keyName }, (response) => {
            if (response) {
                switch (keyName) {
                    case 'getUserEmail':
                        currentUser = response.key;
                        break;
                    default:
                        console.warn(`Unknown keyName: ${keyName}`);
                        break;
                }
                resolve(response.key);
            } else {
                reject(`Não foi possível obter o ${keyName}.`);
            }
        });
    });
}

async function init() {
    await getSecureKey('getUserEmail');
    document.getElementById('training-link').href = getTrainingLink(currentUser);
}