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

function addTooltipToElements() {
    document.querySelectorAll('vh-t').forEach(element => {
        element.addEventListener('click', function(event) {
            // Remove qualquer tooltip existente
            const existingTooltip = document.querySelector('.tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }

            // Cria a tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('translate');

            // Obter a posição do elemento clicado
            const rect = event.target.getBoundingClientRect();

            // Posicionar a tooltip acima do elemento clicado
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 30}px`; // 30px para um pequeno offset

            // Adicionar a tooltip ao body
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

const supabaseUrl = 'https://wgkakdbjxdqfdshqodtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM'

function getAllWord() {
    var xhr = new XMLHttpRequest();
    var result = null;

    // Configura a solicitação
    xhr.open('GET', `${supabaseUrl}/rest/v1/translate`, false);
    xhr.setRequestHeader('apikey', supabaseKey);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);

    // Envia a solicitação
    xhr.send();

    // Processa a resposta
    if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        if (data.length > 0) {
            result = {};
            for (const row in data) {
                result[data[row]['word']] = data[row]['translate']
            }
        }
    } else {
        console.error('Error retrieving value:', xhr.statusText);
    }

    return result;
}

const wordsDontknow = getAllWord();

highlightWords();
addTooltipToElements();