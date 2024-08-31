const msgMultiLanguage = {
    'pt': {
        'loginAlert': 'Para garantir que suas palavras sejam acessíveis em outros dispositivos, é recomendável que a sincronização do Google Chrome esteja ativada. Caso contrário, suas palavras podem não ser armazenadas permanentemente.',
        'chooseLanguage': 'Escolha sua Língua Nativa',
        'info-message': 'Atualize a página para usar a nova configuração!',
        'info-second-message': 'Palavras já marcadas não serão atualizadas automaticamente.'
    },
    'en': {
        'loginAlert': 'To ensure your words are accessible on other devices, it is recommended that Google Chrome sync is turned on. Otherwise, your words may not be stored permanently.',
        'chooseLanguage': 'Choose your Native Language',
        'info-message': 'Refresh the page to use the new setting!',
        'info-second-message': 'Words already marked will not be updated automatically.'
    },
    'zh': {
        'loginAlert': '为了确保您的单词可以在其他设备上访问，建议打开Google Chrome同步功能。否则，您的单词可能不会被永久存储。',
        'chooseLanguage': '选择您的母语',
        'info-message': '刷新页面以使用新设置！',
        'info-second-message': '已标记的单词不会自动更新。'
    },
    'hi': {
        'loginAlert': 'यह सुनिश्चित करने के लिए कि आपके शब्द अन्य उपकरणों पर पहुंच योग्य हों, यह अनुशंसा की जाती है कि Google Chrome सिंक चालू हो। अन्यथा, आपके शब्द स्थायी रूप से संग्रहीत नहीं हो सकते हैं।',
        'chooseLanguage': 'अपनी मातृभाषा चुनें',
        'info-message': 'नई सेटिंग का उपयोग करने के लिए पेज को रीफ्रेश करें!',
        'info-second-message': 'पहले से चिह्नित शब्द स्वतः अपडेट नहीं होंगे।'
    },
    'es': {
        'loginAlert': 'Para garantizar que tus palabras sean accesibles en otros dispositivos, se recomienda que la sincronización de Google Chrome esté activada. De lo contrario, tus palabras pueden no almacenarse permanentemente.',
        'chooseLanguage': 'Elige tu idioma nativo',
        'info-message': '¡Actualiza la página para usar la nueva configuración!',
        'info-second-message': 'Las palabras ya marcadas no se actualizarán automáticamente.'
    },
    'fr': {
        'loginAlert': 'Pour vous assurer que vos mots sont accessibles sur d\'autres appareils, il est recommandé d\'activer la synchronisation de Google Chrome. Sinon, vos mots pourraient ne pas être stockés de manière permanente.',
        'chooseLanguage': 'Choisissez votre langue maternelle',
        'info-message': 'Actualisez la page pour utiliser le nouveau paramètre !',
        'info-second-message': 'Les mots déjà marqués ne seront pas mis à jour automatiquement.'
    },
    'ar': {
        'loginAlert': 'لضمان أن كلماتك متاحة على الأجهزة الأخرى، يُنصح بتشغيل مزامنة Google Chrome. خلاف ذلك، قد لا يتم تخزين كلماتك بشكل دائم.',
        'chooseLanguage': 'اختر لغتك الأم',
        'info-message': 'قم بتحديث الصفحة لاستخدام الإعداد الجديد!',
        'info-second-message': 'لن يتم تحديث الكلمات التي تم تمييزها مسبقًا تلقائيًا.'
    },
    'ru': {
        'loginAlert': 'Чтобы ваши слова были доступны на других устройствах, рекомендуется включить синхронизацию Google Chrome. В противном случае ваши слова могут не сохраняться постоянно.',
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