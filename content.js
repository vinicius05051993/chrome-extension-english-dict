let apiTranslateKey;
let wordsDontknow = {};
let targetLanguage = 'pt';

async function highlightWords() {
    for (const [wordToWrap, translate] of Object.entries(wordsDontknow)) {
        highlightWord(wordToWrap, translate);
    }
}

function highlightWord(wordToWrap, translate) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span');

    elements.forEach(element => {
        const regex = new RegExp(`(?!<vh-t[^>]*>)\\b${wordToWrap}\\b(?!<\\/vh-t>)`, 'gi');
        if (regex.test(element.textContent)) {
            element.innerHTML = element.innerHTML.replace(regex, `<vh-t translate="${translate}">${wordToWrap}</vh-t>`);
            addTooltipToElement(element);
        }
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

                        chrome.storage.sync.get('myWords', async function(result) {
                            wordsDontknow = result.myWords || {};
                            highlightWords();
                        });
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

function init() {
    chrome.storage.sync.get('targetLanguage', function(data) {
        targetLanguage = data.targetLanguage || 'pt';
    });
    getSecureKey('getSecretTranslateKey');

    document.addEventListener('click', function(event) {
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

    floatingDiv.addEventListener('click', function() {
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
    const sel = (document.selection && document.selection.createRange().text) ||
        (window.getSelection && window.getSelection().toString());

    if (sel) {
        const existingTeacher = document.querySelector('.teacher');
        if (existingTeacher) {
            existingTeacher.remove();
        }

        if (sel in wordsDontknow) {
            delete wordsDontknow[sel];
            chrome.storage.sync.set({ 'myWords': wordsDontknow }, function() {});
            removeWordFromVHT(sel);
        } else {
            const teacher = document.createElement('div');
            teacher.className = 'teacher';

            const textSpan = document.createElement('span');
            const translateSel = await translateWord(sel);
            textSpan.textContent = translateSel;

            wordsDontknow[sel] = translateSel;
            chrome.storage.sync.set({ 'myWords': wordsDontknow }, function() {});

            highlightWord(sel, translateSel);

            teacher.appendChild(textSpan);

            teacher.style.position = 'absolute';
            teacher.style.left = `${event.pageX}px`;
            teacher.style.top = `${event.pageY - 50}px`;

            document.body.appendChild(teacher);
        }
    }
});

document.addEventListener('click', function() {
    const existingTeacher = document.querySelector('.teacher');
    if (existingTeacher) {
        existingTeacher.remove();
    }
});

init();
createFloatingDiv();
