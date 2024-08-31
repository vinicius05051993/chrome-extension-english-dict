const msgMultiLanguage = {
    'pt': {
        'loginAlert': 'Para garantir que suas palavras sejam acessíveis em outros dispositivos, é recomendável que a sincronização do Google Chrome esteja ativada. Caso contrário, suas palavras podem não ser armazenadas permanentemente.',
        'chooseLanguage': 'Escolha sua Lingua Nativa',
        'info-message': 'Atualize a página para usar a nova configuração!',
        'info-second-message': 'Palavras já marcadas não serão atualizadas automaticamente.'
    },
    'en': {
        'loginAlert': 'To ensure your words are accessible on other devices, it is recommended that Google Chrome sync is turned on. Otherwise, your words may not be stored permanently.',
        'chooseLanguage': 'Choose your Native Language',
        'info-message': 'Refresh the page to use the new setting!',
        'info-second-message': 'Words already marked will not be updated automatically.'
    },
}

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