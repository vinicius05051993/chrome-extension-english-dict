document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('targetLanguage', function(data) {
        document.getElementById('language-select').value = data.targetLanguage || 'pt';
    });
});

chrome.identity.getProfileUserInfo(function(userInfo) {
    if (!userInfo.email) {
        document.getElementById('loginAlert').style.display = 'block';
    }
});

document.getElementById('language-select').addEventListener('change', function() {
    let language = this.value;
    chrome.storage.sync.set({ targetLanguage: language }, function() {});
    document.getElementById('info-message').innerText = 'Atualize a página para usar a nova configuração!'
    document.getElementById('info-second-message').innerText = 'Palavras já marcadas não serão atualizadas automaticamente.'
});