const secretTranslateKey = "AIzaSyD5eo942YXElyvkwo9GNe5jxpBDBPf-ftc";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecretTranslateKey') {
        sendResponse({ key: secretTranslateKey });
    } else if (request.action === 'getSupabaseKey') {
        sendResponse({ key: supabaseKey });
    } else if (request.action === 'getUserEmail') {
        chrome.identity.getProfileUserInfo(async function(userInfo) {
            sendResponse({ key: userInfo.email });
        });

        return true;
    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
