const secretTranslateKey = "AIzaSyD5eo942YXElyvkwo9GNe5jxpBDBPf-ftc";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecretTranslateKey') {
        sendResponse({ key: secretTranslateKey });

    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
