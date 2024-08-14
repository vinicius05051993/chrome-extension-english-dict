function highlightWords() {
    // Função para envolver cada palavra em um span
    function wrapWordsWithSpan(text) {
        return text.replace(/(\b[\wÀ-ú'-]+\b)/g, '<vh-t class="highlight-word">$1</vh-t>');
    }

    // Itera sobre os elementos específicos (h1, h2, h3, h4, p)
    function processElement(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            const wrapper = document.createElement('vh-t');
            wrapper.innerHTML = wrapWordsWithSpan(element.textContent);
            element.replaceWith(wrapper);
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            // Processa apenas elementos de texto dentro de h1, h2, h3, h4, p
            if (['H1', 'H2', 'H3', 'H4', 'P', 'span'].includes(element.nodeName)) {
                element.childNodes.forEach(child => processElement(child));
            }
        }
    }

    // Seleciona todos os elementos h1, h2, h3, h4 e p e processa
    const elementsToProcess = document.querySelectorAll('h1, h2, h3, h4, p, span');
    elementsToProcess.forEach(element => processElement(element));

    // Adiciona a regra CSS para a classe .highlight-word
    const style = document.createElement('style');
    style.textContent = `
        .highlight-word {
            transition: color 0.3s;
        }
        .highlight-word:hover {
            color: blue;
        }
    `;
    document.head.appendChild(style);
}

// Chama a função para destacar as palavras
highlightWords();
