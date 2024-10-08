var apiTranslateKey;
var SUPABASE_URL = 'https://wgkakdbjxdqfdshqodtw.supabase.co';
var SUPABASE_API_KEY;
var wordsDontknow = {};
var targetLanguage = 'pt';
var currentUser;
var isDragging = false;

async function highlightWords() {
    for (const [wordToWrap, translate] of Object.entries(wordsDontknow)) {
        highlightWord(wordToWrap, translate);
    }
}

function highlightWord(wordToWrap, translate) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span');

    elements.forEach(element => {
        const childNodes = Array.from(element.childNodes);

        childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const regex = new RegExp(`\\b${wordToWrap}\\b`, 'gi');
                if (regex.test(node.textContent)) {
                    const wrappedText = node.textContent.replace(regex, `<vh-t translate="${translate}">${wordToWrap}</vh-t>`);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = wrappedText;
                    node.replaceWith(...tempDiv.childNodes);
                }
            }
        });

        addTooltipToElement(element);
    });
}

function addTooltipToElement(mainElement) {
    mainElement.querySelectorAll('vh-t').forEach(element => {
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
            tooltip.style.top = `${rect.top + window.scrollY - 30}px`;

            document.body.appendChild(tooltip);
        });
    });
}

async function getSecureKey(keyName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: keyName }, (response) => {
            if (response) {
                switch (keyName) {
                    case 'getSecretTranslateKey':
                        apiTranslateKey = response.key;
                        break;
                    case 'getSupabaseKey':
                        SUPABASE_API_KEY = response.key;
                        break;
                    case 'getUserEmail':
                        currentUser = response.key;
                        break;
                    default:
                        console.warn(`Unknown keyName: ${keyName}`);
                        break;
                }
                resolve(response.key);
            } else {
                reject(`Não foi possível obter o ${keyName}.`);
            }
        });
    });
}

async function getMyWords() {
    if (currentUser) {
        const url = `${SUPABASE_URL}/rest/v1/translations?user=eq.${encodeURIComponent(currentUser)}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_API_KEY,
                    'Authorization': `Bearer ${SUPABASE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar dados: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.length > 0) {
                wordsDontknow = JSON.parse(data[0].my_words) || {};
                await highlightWords();
            } else {
                console.log('Nenhum dado encontrado para este usuário.');
                wordsDontknow = {};
            }
        } catch (error) {
            console.error('Erro ao buscar dados da Supabase:', error);
        }
    } else {
        console.log('Usuário não fez login!')
    }
}

async function setMyWords() {
    if (currentUser) {
        const url = `${SUPABASE_URL}/rest/v1/translations?user=eq.${encodeURIComponent(currentUser)}`;

        try {
            const checkResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_API_KEY,
                    'Authorization': `Bearer ${SUPABASE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            });

            const checkData = await checkResponse.json();

            if (checkData.length > 0) {
                const updateUrl = `${SUPABASE_URL}/rest/v1/translations?user=eq.${encodeURIComponent(currentUser)}`;

                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_API_KEY,
                        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        my_words: wordsDontknow
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error(`Erro ao atualizar os dados: ${updateResponse.statusText}`);
                }

                console.log('Dados atualizados com sucesso');
            } else {
                const insertUrl = `${SUPABASE_URL}/rest/v1/translations`;

                const insertResponse = await fetch(insertUrl, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_API_KEY,
                        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: currentUser,
                        my_words: wordsDontknow
                    })
                });

                if (!insertResponse.ok) {
                    throw new Error(`Erro ao inserir os dados: ${insertResponse.statusText}`);
                }

                console.log('Nova linha criada com sucesso');
            }
        } catch (error) {
            console.error('Erro ao enviar dados para a Supabase:', error);
        }
    } else {
        console.log('Usuário não fez login!')
    }
}

async function init() {
    await getSecureKey('getSecretTranslateKey');
    await getSecureKey('getSupabaseKey');
    await getSecureKey('getUserEmail');
    await getMyWords();

    chrome.storage.sync.get('targetLanguage', function (data) {
        targetLanguage = data.targetLanguage || 'pt';
    });

    document.addEventListener('click', function (event) {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip && !event.target.closest('vh-t')) {
            tooltip.remove();
        }
    });
}

async function translateWord(wordToTranslate) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiTranslateKey}&q=${encodeURIComponent(wordToTranslate)}&target=${targetLanguage}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function createFloatingDiv() {
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('icons/img.png');
    imgElement.alt = 'My Extension Image';
    imgElement.className = 'floatImage';

    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'floatingDiv';
    floatingDiv.appendChild(imgElement);
    document.body.appendChild(floatingDiv);

    const modalVHT = document.createElement('div');
    modalVHT.className = 'modalVHT';

    const modalContentVHT = document.createElement('div');
    modalContentVHT.className = 'modalContentVHT';

    const containerCloseBtn = document.createElement('div');
    containerCloseBtn.className = 'containerCloseBtn';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'closeBtn';
    closeBtn.innerText = 'X';
    containerCloseBtn.appendChild(closeBtn);

    modalVHT.appendChild(containerCloseBtn);
    modalVHT.appendChild(modalContentVHT);
    document.body.appendChild(modalVHT);

    imgElement.addEventListener('click', function() {
        modalVHT.style.display = 'grid';

        modalContentVHT.innerHTML = '';
        for (const key in wordsDontknow) {
            const listItem = document.createElement('p');
            listItem.innerHTML = `<vh-t translate="${wordsDontknow[key]}">${key}</vh-t>`;
            listItem.className = 'li-word-translate';
            modalContentVHT.appendChild(listItem);
        }

        addTooltipToElement(modalContentVHT);
    });

    floatingDiv.addEventListener('mousedown', (e) => {
        if (e.target === imgElement) {
            return;
        }

        isDragging = true;
        offsetX = e.clientX - floatingDiv.offsetLeft;
        offsetY = e.clientY - floatingDiv.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            floatingDiv.style.left = `${e.clientX - offsetX}px`;
            floatingDiv.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    closeBtn.addEventListener('click', function() {
        modalVHT.style.display = 'none';
    });
}

function removeWordFromVHT(wordToUnwrap) {
    const elements = document.querySelectorAll('vh-t');

    elements.forEach(element => {
        if (element.textContent === wordToUnwrap) {
            const parent = element.parentNode;
            const textNode = document.createTextNode(wordToUnwrap);

            parent.insertBefore(textNode, element);
            element.remove();
        }
    });
}

document.addEventListener('dblclick', async function(event) {
    let sel = (document.selection && document.selection.createRange().text) ||
        (window.getSelection && window.getSelection().toString());
    sel = sel.replace(' ', '');

    if (event.ctrlKey && sel !== '') {
        const existingTeacher = document.querySelector('.teacher');
        if (existingTeacher) {
            existingTeacher.remove();
        }

        if (sel in wordsDontknow) {
            delete wordsDontknow[sel];
            removeWordFromVHT(sel);
        } else {
            const teacher = document.createElement('div');
            teacher.className = 'teacher';

            const textSpan = document.createElement('span');
            const translateSel = await translateWord(sel);
            textSpan.textContent = translateSel;

            wordsDontknow[sel] = translateSel;

            highlightWord(sel, translateSel);

            teacher.appendChild(textSpan);

            teacher.style.position = 'absolute';
            teacher.style.left = `${event.pageX}px`;
            teacher.style.top = `${event.pageY - 50}px`;

            document.body.appendChild(teacher);
        }

        await setMyWords();
    }
});

document.addEventListener('click', function() {
    const existingTeacher = document.querySelector('.teacher');
    if (existingTeacher) {
        existingTeacher.remove();
    }
});

init().then(r => createFloatingDiv());

var intervalID = window.setInterval(getMyWords, 180000);
