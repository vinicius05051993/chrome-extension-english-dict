function highlightWords() {
    function needTranslate(word) {
        if (word in wordsDontknow) {
            return wordsDontknow[word]
        } else {
            return false;
        }
    }
    function processElement(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            const words = element.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            words.forEach(word => {
                if (/\S/.test(word)) {
                    const translate = needTranslate(word);
                    if (translate) {
                        const wrapper = document.createElement('vh-t');
                        wrapper.setAttribute('translate', translate);
                        wrapper.innerHTML = word;
                        fragment.appendChild(wrapper);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                } else {
                    fragment.appendChild(document.createTextNode(word));
                }
            });

            element.replaceWith(fragment);
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            if (['H1', 'H2', 'H3', 'H4', 'P', 'SPAN'].includes(element.nodeName)) {
                element.childNodes.forEach(child => processElement(child));
            }
        }
    }

    const elementsToProcess = document.querySelectorAll('h1, h2, h3, h4, p, span');
    elementsToProcess.forEach(element => processElement(element));

    const style = document.createElement('style');
    style.textContent = `
        [translate] {
            color: #3a99bf;
        }
    `;
    document.head.appendChild(style);
}

function highlightWord(wordToWrap, translate) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span');

    elements.forEach(element => {
        const regex = new RegExp(`(?!<vh-t[^>]*>)\\b${wordToWrap}\\b(?!<\\/vh-t>)`, 'gi'); // Procura pela palavra não envolvida
        if (regex.test(element.innerHTML)) {
            element.innerHTML = element.innerHTML.replace(regex, `<vh-t translate=` + translate +`>${wordToWrap}</vh-t>`);
        }
    });
}

function addTooltipToElements() {
    document.querySelectorAll('vh-t').forEach(element => {
        element.addEventListener('click', function(event) {
            const existingTooltip = document.querySelector('.tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('translate');

            const rect = event.target.getBoundingClientRect();

            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 30}px`; // 30px para um pequeno offset

            document.body.appendChild(tooltip);
        });
    });

    // Fecha a tooltip ao clicar em qualquer outro lugar da página
    document.addEventListener('click', function(event) {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip && !event.target.closest('vh-t')) {
            tooltip.remove();
        }
    });
}

var apiTranslateKey;
var supabaseUrl;
var supabaseKey;

function getSecureKey(keyName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: keyName }, (response) => {
            if (response) {
                switch (keyName) {
                    case 'getSecretTranslateKey':
                        apiTranslateKey = response.key;
                        break;
                    case 'supabaseUrl':
                        supabaseUrl = response.key;
                        break;
                    case 'supabaseKey':
                        supabaseKey = response.key;
                        break;
                    case 'supabaseLoggedToken':
                        supabaseLoggedToken = response.key;
                        break;
                    case 'supabaseLoggedUserId':
                        supabaseLoggedUserId = response.key;
                        break;
                    default:
                        console.warn(`Unknown keyName: ${keyName}`);
                        break;
                }
                resolve(response.key);
            } else {
                reject('Não foi possível obter o secretKey.');
            }
        });
    });
}

async function loadAllKeys() {
    try {
        await getSecureKey('getSecretTranslateKey');
        await getSecureKey('supabaseUrl');
        await getSecureKey('supabaseKey');

        wordsDontknow = await getAllWord();

        highlightWords();
        addTooltipToElements();
    } catch (error) {
        console.log('sem variavel de usuario')
    }
}

loadAllKeys();

var supabaseLoggedToken = false;
var supabaseLoggedUserId = false;

async function saveTranslate(key, value) {
    await getSecureKey('supabaseLoggedToken');
    await getSecureKey('supabaseLoggedUserId');

    if (supabaseLoggedToken && supabaseLoggedUserId) {
        let response = await fetch(`${supabaseUrl}/rest/v1/translate?select=id&word=eq.${key}`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseLoggedToken}`
            }
        });

        let translateId;

        if (response.ok) {
            const data = await response.json();

            if (data.length > 0) {
                translateId = data[0].id;
            } else {
                response = await fetch(`${supabaseUrl}/rest/v1/translate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseLoggedToken}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ word: key, translate: value, type: 'en-pt' })
                });

                if (response.ok) {
                    const insertData = await response.json();
                    translateId = insertData[0].id; // Obter o ID da nova palavra inserida
                } else {
                    console.error('Erro ao inserir a palavra na tabela translate:', response.statusText);
                    return;
                }
            }

            response = await fetch(`${supabaseUrl}/rest/v1/user_relation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseLoggedToken}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ user_id: supabaseLoggedUserId, translate_id: translateId })
            });

            if (response.ok) {
                wordsIdRelation[key] = translateId;
                console.log('Relação entre usuário e palavra inserida com sucesso!');
            } else {
                console.error('Erro ao inserir a relação na tabela user_relation:', response.statusText);
            }
        }
    } else {
        console.log('Faça login');
    }
}

async function deleteTranslate(key) {
    await getSecureKey('supabaseLoggedToken');
    await getSecureKey('supabaseLoggedUserId');

    let response;
    if (supabaseLoggedToken && supabaseLoggedUserId) {
        let translateId = wordsIdRelation[key];
        const deleteUrl = `${supabaseUrl}/rest/v1/user_relation?user_id=eq.${supabaseLoggedUserId}&translate_id=eq.${translateId}`;
        response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseLoggedToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });
    } else {
        console.log('Faça login');
    }
}

async function getAllWord() {
    await getSecureKey('supabaseLoggedToken');
    await getSecureKey('supabaseLoggedUserId');

    if (supabaseLoggedToken && supabaseLoggedUserId) {
        var xhr = new XMLHttpRequest();
        var result = {};

        xhr.open('GET', `${supabaseUrl}/rest/v1/translate?select=*,user_relation!inner(user_id)&user_relation.user_id=eq.${supabaseLoggedUserId}`, false);
        xhr.setRequestHeader('apikey', supabaseKey);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseLoggedToken}`);

        xhr.send();

        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (data.length > 0) {
                result = {};
                for (const row in data) {
                    result[data[row]['word']] = data[row]['translate']
                    wordsIdRelation[data[row]['word']] = [data[row]['id']]
                }
            }
        } else {
            console.error('Error retrieving value:', xhr.statusText);
        }

        return result;
    } else {
        console.log('Faça login');
        return {};
    }
}

let wordsDontknow = {};
let wordsIdRelation = {};

function translateWord(wordToTranslate) {
    const targetLanguage = 'pt';
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiTranslateKey}&q=${encodeURIComponent(wordToTranslate)}&target=${targetLanguage}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();

    if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const translatedText = response.data.translations[0].translatedText;
        console.log(`Translated Text: ${translatedText}`);
        return translatedText;
    } else {
        console.error('Error:', xhr.statusText);
        return null;
    }
}

function removeWordFromVHT(wordToUnwrap) {
    const elements = document.querySelectorAll('vh-t');

    elements.forEach(element => {
        const regex = new RegExp(`\\b${wordToUnwrap}\\b`, 'g');

        if (regex.test(element.textContent)) {
            const parent = element.parentNode;
            const textNode = document.createTextNode(wordToUnwrap);

            parent.insertBefore(textNode, element);
            element.remove();
        }
    });
}

document.ondblclick = function (event) {
    var sel = (document.selection && document.selection.createRange().text) ||
        (window.getSelection && window.getSelection().toString());

    if (sel) {
        const existingTeacher = document.querySelector('.teacher');
        if (existingTeacher) {
            existingTeacher.remove();
        }

        if (sel in wordsDontknow) {
            deleteTranslate(sel)
            delete wordsDontknow[sel];
            removeWordFromVHT(sel);
        } else {
            const teacher = document.createElement('div');
            teacher.className = 'teacher';

            const textSpan = document.createElement('span');

            var translateSel = translateWord(sel);
            textSpan.textContent = translateSel;

            wordsDontknow[sel] = translateSel;
            highlightWord(sel, translateSel);
            addTooltipToElements();

            saveTranslate(sel, translateSel);

            teacher.appendChild(textSpan);

            teacher.style.position = 'absolute';
            teacher.style.left = `${event.pageX}px`;
            teacher.style.top = `${event.pageY - 50}px`;

            document.body.appendChild(teacher);
        }
    }
};

document.onclick = function () {
    const existingTeacher = document.querySelector('.teacher');
    if (existingTeacher) {
        existingTeacher.remove();
    }
}
