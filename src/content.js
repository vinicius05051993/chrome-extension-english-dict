var apiTranslateKey;
var SUPABASE_URL = 'https://wgkakdbjxdqfdshqodtw.supabase.co';
var SUPABASE_API_KEY;
var wordsDontknow = new Proxy({}, {
    set(target, prop, value) {
        if (allowSupaBaseComunication) {
            console.log(`Palavra adicionada: ${prop} = ${value}`);
            sendWordToSupaBase(prop, value).then(r =>
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

import { createClient } from '@supabase/supabase-js';

async function init() {
    await getSecureKey('getSecretTranslateKey');
    await getSecureKey('getSupabaseKey');
    await getSecureKey('getUserEmail');

    SUPABASE_CLIENT = createClient(SUPABASE_URL, SUPABASE_API_KEY)

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

async function getOrCreateUserId(userEmail) {
    // Busca usuário
    let { data: userData, error: userError } = await SUPABASE_CLIENT
        .from('user')
        .select('id')
        .eq('user', userEmail)
        .single();

    if (userError || !userData) {
        // Insere usuário se não existir
        const { data: insertData, error: insertError } = await SUPABASE_CLIENT
            .from('user')
            .insert({ user: userEmail })
            .select('id')
            .single();

        if (insertError) {
            console.error('Erro ao inserir usuário:', insertError);
            return null;
        }
        return insertData.id;
    } else {
        return userData.id;
    }
}

async function getOrCreateWordId(word, translation) {
    // Busca palavra
    let { data: wordData, error: wordError } = await SUPABASE_CLIENT
        .from('word')
        .select('id')
        .eq('word', word)
        .single();

    if (wordData) {
        return wordData.id;
    }

    // Insere palavra se não existir
    const { data: insertData, error: insertError } = await SUPABASE_CLIENT
        .from('word')
        .insert({ word, translation })
        .select('id')
        .single();

    if (insertError) {
        // Palavra já existe, busca novamente o id
        const { data: retryData, error: retryError } = await SUPABASE_CLIENT
            .from('word')
            .select('id')
            .eq('word', word)
            .single();
        if (retryData) return retryData.id;
        console.error('Erro ao inserir palavra:', insertError);
        return null;
    }
    return insertData.id;
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

    // Busca o id da palavra
    const wordId = await getOrCreateWordId(prop, value);
    if (!wordId) return;

    // Conta quantas frases já existem para essa palavra
    const { data: phaseData, error: phaseError } = await SUPABASE_CLIENT
        .from('word_phase')
        .select('id', { count: 'exact', head: true })
        .eq('word', wordId);

    if (phaseError) {
        console.error('Erro ao contar frases:', phaseError);
        return;
    }

    if (phaseData && phaseData.length >= maxPhaseQty) {
        console.log('Quantidade máxima de frases já cadastrada para essa palavra.');
        return;
    }

    // Só busca novas frases se ainda não atingiu o limite
    const elements = document.querySelectorAll('h1, h2, h3, h4, p, span');
    const sentencesSet = new Set();

    elements.forEach(element => {
        const sentences = element.textContent.split(/(?<=[.!?])\s+/);
        sentences.forEach(sentence => {
            const regex = new RegExp(`\\b${prop}\\b`, 'i');
            const cleanSentence = sentence.trim();
            if (
                regex.test(cleanSentence) &&
                cleanSentence.length > 0 &&
                cleanSentence.length <= 500
            ) {
                sentencesSet.add(cleanSentence);
            }
        });
    });

    for (const phase of sentencesSet) {
        // Verifica se a frase já existe na tabela phase
        const { data: existing, error: selectError } = await SUPABASE_CLIENT
            .from('phase')
            .select('id')
            .eq('phase', phase)
            .single();

        let phaseId;
        if (!existing) {
            const { data: insertData, error: insertError } = await SUPABASE_CLIENT
                .from('phase')
                .insert({ phase })
                .select('id')
                .single();

            if (insertError) {
                console.error('Erro ao inserir frase:', insertError);
                continue;
            }
            phaseId = insertData.id;
        } else {
            phaseId = existing.id;
        }

        // Verifica se a relação já existe em word_phase
        const { data: relExists, error: relExistsError } = await SUPABASE_CLIENT
            .from('word_phase')
            .select('id')
            .eq('word', wordId)
            .eq('phase', phaseId)
            .single();

        if (!relExists) {
            // Cria relação na word_phase
            const { error: relError } = await SUPABASE_CLIENT
                .from('word_phase')
                .insert({ word: wordId, phase: phaseId });

            if (relError) {
                console.error('Erro ao vincular frase à palavra:', relError);
            } else {
                console.log('Frase vinculada à palavra:', phase);
            }
        } else {
            console.log('Relação word_phase já existe:', phase);
        }
    }
}

async function sendWordToSupaBase(prop, value) {
    if (!currentUser) {
        console.log('Usuário não fez login!');
        return;
    }

    try {
        const userId = await getOrCreateUserId(currentUser);
        const wordId = await getOrCreateWordId(prop, value);

        if (!userId || !wordId) return;

        // Verifica se a relação já existe
        const { data: relationData, error: relationError } = await SUPABASE_CLIENT
            .from('user_word')
            .select('id')
            .eq('user', userId)
            .eq('word', wordId)
            .single();

        if (relationData) {
            console.log('Relação já existe, não será inserida novamente.');
            return;
        }

        // Insere em user_word se não existir
        const { data, error } = await SUPABASE_CLIENT
            .from('user_word')
            .insert({
                user: userId,
                word: wordId
            });

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
    }
});

document.addEventListener('click', function() {
    const existingTeacher = document.querySelector('.teacher');
    if (existingTeacher) {
        existingTeacher.remove();
    }
});

init().then(r => "");
