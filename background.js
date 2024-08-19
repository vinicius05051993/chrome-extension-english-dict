// Armazenando o secret_key de forma privada
const secretTranslateKey = "AIzaSyD5eo942YXElyvkwo9GNe5jxpBDBPf-ftc";
const supabaseUrl = "https://wgkakdbjxdqfdshqodtw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM";

var supabaseLoggedToken = '';
var supabaseLoggedUserId = '';

// Função para lidar com mensagens do content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecretTranslateKey') {
        sendResponse({ key: secretTranslateKey });
    } else if (request.action === 'supabaseUrl') {
        sendResponse({ key: supabaseUrl });
    } else if (request.action === 'supabaseKey') {
        sendResponse({ key: supabaseKey });
    } else if (request.action === 'supabaseLoggedToken') {
        sendResponse({ key: supabaseLoggedToken });
    } else if (request.action === 'supabaseLoggedUserId') {
        sendResponse({ key: supabaseLoggedUserId });
    } else if (request.action === 'saveToken') {
        supabaseLoggedToken = request.token;
    } else if (request.action === 'SaveUserId') {
        supabaseLoggedUserId = request.id;
    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
