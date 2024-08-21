// Armazenando o secret_key de forma privada
const secretTranslateKey = "AIzaSyD5eo942YXElyvkwo9GNe5jxpBDBPf-ftc";
const supabaseUrl = "https://wgkakdbjxdqfdshqodtw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecretTranslateKey') {
        sendResponse({ key: secretTranslateKey });

    } else if (request.action === 'supabaseUrl') {
        sendResponse({ key: supabaseUrl });

    } else if (request.action === 'supabaseKey') {
        sendResponse({ key: supabaseKey });

    } else if (request.action === 'supabaseLoggedToken') {
        chrome.storage.local.get(['supabaseLoggedToken'], (result) => {
            sendResponse({ key: result.supabaseLoggedToken });
        });
        return true;

    } else if (request.action === 'supabaseLoggedUserId') {
        chrome.storage.local.get(['supabaseLoggedUserId'], (result) => {
            sendResponse({ key: result.supabaseLoggedUserId });
        });
        return true;

    } else if (request.action === 'saveLoggedToken') {
        chrome.storage.local.set({ supabaseLoggedToken: request.value }, () => {
            sendResponse({ key: 'supabaseLoggedToken', value: request.value });
        });
        return true;

    } else if (request.action === 'saveLoggedUserId') {
        chrome.storage.local.set({ supabaseLoggedUserId: request.value }, () => {
            sendResponse({ key: 'supabaseLoggedUserId', value: request.value });
        });
        return true;

    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
