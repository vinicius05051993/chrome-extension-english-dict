const supabaseKey = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSupabaseKey') {
        sendResponse({ key: supabaseKey });
    } else if (request.action === 'getUserEmail') {
        chrome.identity.getProfileUserInfo(async function(userInfo) {
            sendResponse({ key: userInfo.email.toLowerCase() });
        });

        return true;
    } else {
        sendResponse({ error: 'Ação desconhecida' });
    }
});
