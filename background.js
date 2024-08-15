// Armazenando o secret_key de forma privada
const secretTranslateKey = "";
const supabaseUrl = "";
const supabaseKey = "";

// Função para lidar com mensagens do content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecretTranslateKey') {
        sendResponse({ key: secretTranslateKey });
    } else if (request.action === 'supabaseUrl') {
        sendResponse({ key: supabaseUrl });
    } else if (request.action === 'supabaseKey') {
        sendResponse({ key: supabaseKey });
    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
