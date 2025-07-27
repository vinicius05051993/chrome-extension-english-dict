var SUPABASE_URL = 'https://wgkakdbjxdqfdshqodtw.supabase.co';
var SUPABASE_API_KEY;
var wordsDontknow = new Proxy({}, {
    set(target, prop, value) {
        if (allowSupaBaseComunication) {
            console.log(`Palavra adicionada: ${prop} = ${value}`);
            saveWordRelationToSupaBase(prop, value).then(r =>
                sendPhaseToSupaBase(prop, value).then(r => console.log(`Frases enviadas para Supabase para a palavra ${prop}.`))
            );
        }
        target[prop] = value;
        return true;
    },
    deleteProperty(target, prop) {
        deleteWordToSupaBase(prop).then(r => console.log(`Palavra ${prop} removida do Supabase.`));
        delete target[prop];
        return true;
    }
});
var targetLanguage = 'pt';
var currentUser;
var SUPABASE_CLIENT;
var allowSupaBaseComunication = true;
var maxPhaseQty = 10;

import {createClient} from '@supabase/supabase-js';

async function init() {
    await getSecureKey('getSupabaseKey');
    await getSecureKey('getUserEmail');

    SUPABASE_CLIENT = createClient(SUPABASE_URL, SUPABASE_API_KEY)

    setTimeout(async () => {
        await getMyWords();
    }, 1000);

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

const userIdCache = {};
async function getOrCreateUserId(userEmail) {
    if (userIdCache[userEmail]) {
        return userIdCache[userEmail];
    }

    const { data, error } = await SUPABASE_CLIENT
        .rpc('get_or_create_user_id', { user_email: userEmail });

    if (error) {
        console.error('Erro ao chamar função get_or_create_user_id:', error);
        return null;
    }

    userIdCache[userEmail] = data;
    return data;
}

const wordIdCache = {};
async function getOrCreateWordId(word, translation) {
    const cacheKey = `${word}::${translation}`;
    if (wordIdCache[cacheKey]) {
        return wordIdCache[cacheKey];
    }

    const { data, error } = await SUPABASE_CLIENT
        .rpc('get_or_create_word_id', { word_input: word, translation_input: translation });

    if (error) {
        console.error('Erro ao chamar função get_or_create_word_id:', error);
        return null;
    }
    wordIdCache[cacheKey] = data;
    return data;
}

async function deleteWordToSupaBase(prop) {
    if (!currentUser) {
        console.log('Usuário não fez login!');
        return;
    }

    try {
        const userId = await getOrCreateUserId(currentUser);
        const wordId = await getOrCreateWordId(prop, false);

        if (!userId || !wordId) return;

        // Deleta a relação user_word
        const { error } = await SUPABASE_CLIENT
            .from('user_word')
            .delete()
            .eq('user', userId)
            .eq('word', wordId);

        if (error) {
            console.error('Erro ao deletar relação em user_word:', error);
        } else {
            console.log('Relação deletada com sucesso.');
        }
    } catch (error) {
        console.error('Erro geral:', error);
    }
}

async function sendPhaseToSupaBase(prop, value) {
    if (!currentUser) {
        console.log('Usuário não fez login!');
        return;
    }

    const wordId = await getOrCreateWordId(prop, value);
    if (!wordId) return;

    const phaseCount = await getPhaseCount(wordId);
    if (phaseCount === null || phaseCount >= maxPhaseQty) {
        console.log('Quantidade máxima de frases já cadastrada para essa palavra.');
        return;
    }

    const sentencesSet = await getSupabaseSentences(prop, maxPhaseQty);

    if (phaseCount + sentencesSet.size < maxPhaseQty) {
        addSentencesFromDOM(prop, sentencesSet, maxPhaseQty - (phaseCount + sentencesSet.size));
    }

    for (const phase of sentencesSet) {
        const phaseId = await getOrInsertPhaseId(phase);
        if (!phaseId) continue;

        await insertWordPhaseRelation(wordId, phaseId, phase);
    }
}

async function getPhaseCount(wordId) {
    const { data, error } = await SUPABASE_CLIENT
        .from('word_phase')
        .select('id', { count: 'exact', head: true })
        .eq('word', wordId);

    if (error) {
        console.error('Erro ao contar frases:', error);
        return null;
    }
    return data ? data.length : 0;
}

async function getSupabaseSentences(prop, limit) {
    const sentencesSet = new Set();
    const { data, error } = await SUPABASE_CLIENT
        .from('phase')
        .select('phase')
        .ilike('phase', `%${prop}%`)
        .limit(limit);

    if (error) {
        console.error('Erro ao buscar frases no Supabase:', error);
    } else if (data && data.length > 0) {
        data.forEach(item => {
            const cleanSentence = item.phase.trim();
            sentencesSet.add(cleanSentence);
        });
    }
    return sentencesSet;
}

function addSentencesFromDOM(prop, sentencesSet, maxToAdd) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span');
    let added = 0;

    elements.forEach(element => {
        if (added >= maxToAdd) return;
        const sentences = element.textContent.split(/(?<=[.!?])\s+/);
        sentences.forEach(sentence => {
            if (added >= maxToAdd) return;
            const regex = new RegExp(`\\b${prop}\\b`, 'i');
            const cleanSentence = sentence.trim();
            if (
                regex.test(cleanSentence) &&
                cleanSentence.length > 80 &&
                cleanSentence.length <= 500 &&
                !/[><{})_'("]/.test(cleanSentence)
            ) {
                if (!sentencesSet.has(cleanSentence)) {
                    sentencesSet.add(cleanSentence);
                    added++;
                }
            }
        });
    });
}

async function getOrInsertPhaseId(phase) {
    const { data, error } = await SUPABASE_CLIENT
        .rpc('insert_phase', { phase_text: phase });

    if (error) {
        console.error('Erro ao inserir/buscar frase:', error);
        return null;
    }
    return data;
}

async function insertWordPhaseRelation(wordId, phaseId, phase) {
    const { error } = await SUPABASE_CLIENT
        .rpc('ensure_word_phase_relation', { word_id: wordId, phase_id: phaseId });

    if (error) {
        console.error('Erro ao vincular frase à palavra:', error);
    } else {
        console.log('Frase vinculada à palavra:', phase);
    }
}

async function saveWordRelationToSupaBase(prop, value) {
    if (!currentUser) {
        console.log('Usuário não fez login!');
        return;
    }

    try {
        const userId = await getOrCreateUserId(currentUser);
        const wordId = await getOrCreateWordId(prop, value);

        if (!userId || !wordId) return;

        const { data, error } = await SUPABASE_CLIENT
            .rpc('get_or_create_user_word_id', { user_id: userId, word_id: wordId });

        if (error) {
            console.error('Erro ao inserir em user_word:', error);
        } else {
            console.log('Palavra vinculada ao usuário com sucesso:', data);
        }
    } catch (error) {
        console.error('Erro geral:', error);
    }
}

async function highlightWords() {
    for (const [wordToWrap, translate] of Object.entries(wordsDontknow)) {
        highlightWord(wordToWrap, translate);
    }
}

function highlightWord(wordToWrap, translate) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span, div');

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
        try {
            const { data, error } = await SUPABASE_CLIENT
                .from('user')
                .select(`
                user_word (
                  word (
                    word,
                    translation
                  )
                )
              `).eq('user', currentUser)

            allowSupaBaseComunication = false;
            data.forEach(item => {
                if (item.user_word && Array.isArray(item.user_word)) {
                    item.user_word.forEach(uw => {
                        if (uw.word && uw.word.word && uw.word.translation) {
                            wordsDontknow[uw.word.word] = uw.word.translation;
                        }
                    });
                }
            });
            allowSupaBaseComunication = true;

            await highlightWords();
        } catch (error) {
            console.error('Erro ao buscar dados da Supabase:', error);
            allowSupaBaseComunication = true;
        }
    } else {
        console.log('Usuário não fez login!')
    }
}

async function translateWord(wordToTranslate) {
    try {
        const response = await fetch(SUPABASE_URL + '/functions/v1/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + SUPABASE_API_KEY
            },
            body: JSON.stringify({
                word: wordToTranslate,
                target: targetLanguage
            })
        });

        if (!response.ok) {
            console.error('Erro ao traduzir:', response.statusText);
            return null;
        }

        return await response.text();
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
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

function isPhase(str) {
    const words = str.trim().split(/\s+/);
    return words.length > 1;
}

document.addEventListener('dblclick', async function(event) {
    let sel = (document.selection && document.selection.createRange().text) ||
        (window.getSelection && window.getSelection().toString());
    sel = sel.replace(' ', '');

    if (event.ctrlKey && sel !== '' && !isPhase(sel)) {
        const existingTeacher = document.querySelector('.teacher');
        if (existingTeacher) {
            existingTeacher.remove();
        }

        if (sel in wordsDontknow) {
            delete wordsDontknow[sel];
            removeWordFromVHT(sel);
        } else {
            const translateSel = await translateWord(sel);
            if (translateSel) {
                const teacher = document.createElement('div');
                teacher.className = 'teacher';

                const textSpan = document.createElement('span');
                textSpan.textContent = translateSel;

                wordsDontknow[sel] = translateSel;

                highlightWord(sel, translateSel);

                teacher.appendChild(textSpan);

                teacher.style.position = 'absolute';
                teacher.style.left = `${event.pageX}px`;
                teacher.style.top = `${event.pageY - 50}px`;

                document.body.appendChild(teacher);
            }
        }
    }
});

document.addEventListener('click', function() {
    const existingTeacher = document.querySelector('.teacher');
    if (existingTeacher) {
        existingTeacher.remove();
    }
});

window.addEventListener('simple-vocabulary-change-word-filter', function(e) {
    highlightWords();
});

init().then(r => "");
