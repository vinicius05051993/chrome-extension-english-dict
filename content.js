function highlightWords() {
    function wrapWordsWithSpan(word) {
        return `<vh-t class="highlight-word">${word}</vh-t>`;
    }

    function processElement(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            const words = element.textContent.split(/(\s+)/); // Preserva os espaços
            const fragment = document.createDocumentFragment();

            words.forEach(word => {
                if (/\S/.test(word)) { // Verifica se não é um espaço em branco
                    const wrapper = document.createElement('vh-t');
                    wrapper.innerHTML = word;
                    fragment.appendChild(wrapper);
                } else {
                    fragment.appendChild(document.createTextNode(word)); // Mantém os espaços intactos
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
        vh-t {
            transition: color 0.3s;
        }
        vh-t:hover {
            color: #3a99bf;
        }
    `;
    document.head.appendChild(style);
}

highlightWords();