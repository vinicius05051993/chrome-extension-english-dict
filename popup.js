const msgMultiLanguage = {
    'pt': {
        'loginAlert': 'Faça login no Google Chrome e ative a sincronização para que as palavras sejam armazenadas corretamente!',
        'chooseLanguage': 'Escolha sua Língua Nativa',
        'info-message': 'Atualize a página para usar a nova configuração!',
        'info-second-message': 'Palavras já marcadas não serão atualizadas automaticamente.'
    },
    'en': {
        'loginAlert': 'Log in to Google Chrome and enable sync so that words are stored correctly!',
        'chooseLanguage': 'Choose your Native Language',
        'info-message': 'Refresh the page to use the new setting!',
        'info-second-message': 'Words already marked will not be updated automatically.'
    },
    'zh': {
        'loginAlert': '登录 Google Chrome 并启用同步，以便正确存储单词！',
        'chooseLanguage': '选择您的母语',
        'info-message': '刷新页面以使用新设置！',
        'info-second-message': '已标记的单词不会自动更新。'
    },
    'hi': {
        'loginAlert': 'शब्दों को सही ढंग से संग्रहीत करने के लिए Google Chrome में लॉग इन करें और सिंक चालू करें!',
        'chooseLanguage': 'अपनी मातृभाषा चुनें',
        'info-message': 'नई सेटिंग का उपयोग करने के लिए पेज को रीफ्रेश करें!',
        'info-second-message': 'पहले से चिह्नित शब्द स्वतः अपडेट नहीं होंगे।'
    },
    'es': {
        'loginAlert': '¡Inicia sesión en Google Chrome y activa la sincronización para que las palabras se almacenen correctamente!',
        'chooseLanguage': 'Elige tu idioma nativo',
        'info-message': '¡Actualiza la página para usar la nueva configuración!',
        'info-second-message': 'Las palabras ya marcadas no se actualizarán automáticamente.'
    },
    'fr': {
        'loginAlert': 'Connectez-vous à Google Chrome et activez la synchronisation afin que les mots soient stockés correctement !',
        'chooseLanguage': 'Choisissez votre langue maternelle',
        'info-message': 'Actualisez la page pour utiliser le nouveau paramètre !',
        'info-second-message': 'Les mots déjà marqués ne seront pas mis à jour automatiquement.'
    },
    'ar': {
        'loginAlert': 'قم بتسجيل الدخول إلى Google Chrome وقم بتمكين المزامنة حتى يتم تخزين الكلمات بشكل صحيح!',
        'chooseLanguage': 'اختر لغتك الأم',
        'info-message': 'قم بتحديث الصفحة لاستخدام الإعداد الجديد!',
        'info-second-message': 'لن يتم تحديث الكلمات التي تم تمييزها مسبقًا تلقائيًا.'
    },
    'ru': {
        'loginAlert': 'Войдите в Google Chrome и включите синхронизацию, чтобы слова сохранялись правильно!',
        'chooseLanguage': 'Выберите родной язык',
        'info-message': 'Обновите страницу, чтобы использовать новый параметр!',
        'info-second-message': 'Ранее отмеченные слова не будут обновлены автоматически.'
    }
};

let targetlanguage = 'pt';

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('targetLanguage', function(data) {
        targetlanguage = data.targetLanguage || 'pt';
        document.getElementById('language-select').value = targetlanguage;

        document.getElementById('loginAlert').innerText = msgMultiLanguage[targetlanguage]['loginAlert'];
        document.getElementById('chooseLanguage').innerText = msgMultiLanguage[targetlanguage]['chooseLanguage'];
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
});