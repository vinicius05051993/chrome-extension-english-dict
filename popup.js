const msgMultiLanguage = {
    'pt': {
        'loginAlert': 'Faça login no Google Chrome para que a extensão funcione corretamente!',
        'chooseLanguage': 'Escolha sua Língua Nativa',
        'info-message': 'Atualize a página para usar a nova configuração!',
        'info-second-message': 'Palavras já marcadas não serão atualizadas automaticamente.'
    },
    'en': {
        'loginAlert': 'Log in to Google Chrome to ensure the extension functions correctly!',
        'chooseLanguage': 'Choose your Native Language',
        'info-message': 'Refresh the page to use the new setting!',
        'info-second-message': 'Words already marked will not be updated automatically.'
    },
    'zh': {
        'loginAlert': '登录 Google Chrome 以确保扩展程序正常运行！',
        'chooseLanguage': '选择您的母语',
        'info-message': '刷新页面以使用新设置！',
        'info-second-message': '已标记的单词不会自动更新。'
    },
    'hi': {
        'loginAlert': 'सुनिश्चित करने के लिए कि एक्सटेंशन सही ढंग से काम करे, Google Chrome में लॉग इन करें!',
        'chooseLanguage': 'अपनी मातृभाषा चुनें',
        'info-message': 'नई सेटिंग का उपयोग करने के लिए पेज को रीफ्रेश करें!',
        'info-second-message': 'पहले से चिह्नित शब्द स्वतः अपडेट नहीं होंगे।'
    },
    'es': {
        'loginAlert': '¡Inicia sesión en Google Chrome para que la extensión funcione correctamente!',
        'chooseLanguage': 'Elige tu idioma nativo',
        'info-message': '¡Actualiza la página para usar la nueva configuración!',
        'info-second-message': 'Las palabras ya marcadas no se actualizarán automáticamente.'
    },
    'fr': {
        'loginAlert': 'Connectez-vous à Google Chrome pour que l\'extension fonctionne correctement !',
        'chooseLanguage': 'Choisissez votre langue maternelle',
        'info-message': 'Actualisez la page pour utiliser le nouveau paramètre !',
        'info-second-message': 'Les mots déjà marqués ne seront pas mis à jour automatiquement.'
    },
    'ar': {
        'loginAlert': 'قم بتسجيل الدخول إلى Google Chrome لضمان أن الامتداد يعمل بشكل صحيح!',
        'chooseLanguage': 'اختر لغتك الأم',
        'info-message': 'قم بتحديث الصفحة لاستخدام الإعداد الجديد!',
        'info-second-message': 'لن يتم تحديث الكلمات التي تم تمييزها مسبقًا تلقائيًا.'
    },
    'ru': {
        'loginAlert': 'Войдите в Google Chrome, чтобы расширение работало корректно!',
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