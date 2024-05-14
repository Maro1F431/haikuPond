let haikuIndex = 0;
let haikuListLength = 0;
let nodeIdCounter = 0;

function mod(a, b) {
    return ((a % b) + b) % b;
}

function setupHiddenHaiku(text) {
    const container = document.querySelector('.haiku-text');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            let br = document.createElement('br');
            container.appendChild(br);
        }
        else {
            let span = document.createElement('span');
            span.textContent = text[i];
            span.className = 'hiddenCharacter';
            container.appendChild(span);
        }
    }
}

function revealHaiku() {
    let i = 0;
    let hiddenCharacters = document.querySelectorAll('.hiddenCharacter');
    function revealCharacter() {
        if (i < hiddenCharacters.length) {
            hiddenCharacters[i].classList.remove('hiddenCharacter');
            hiddenCharacters[i].classList.add('shownCharacter');
            i++;
            setTimeout(revealCharacter, 250); // Adjust timing for effect speed
        }
    }
    revealCharacter();
}

function loadHaiku() {
    fetch('haikus.json')
    .then(response => response.json())
    .then(data => {
        console.log(haikuIndex)
        const haiku = data.haikus[haikuIndex].text; // Access the first haiku
        setupHiddenHaiku(haiku);
        revealHaiku(haiku);
    })
    .catch(error => console.error('Error loading the haiku:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('haikus.json')
    .then(response => response.json())
    .then(data => {
        const haiku = data.haikus[0].text; // Access the first haiku
        setupHiddenHaiku(haiku);
        revealHaiku(haiku);
        haikuListLength = data.haikus.length;
    })
    .catch(error => console.error('Error loading the haiku:', error));
});

document.addEventListener("DOMContentLoaded", function() {
    const topContent = document.getElementById('topContent');
    const reflection = document.getElementById('reflection');

    function initialMirrorContent() {
        const nodes = topContent.querySelectorAll('*'); // Select all elements within topContent
        nodes.forEach(node => {
            const nodeId = `node-${nodeIdCounter++}`; // Generate a unique ID for each node
            node.setAttribute('data-node-id', nodeId);
        });
    
        reflection.innerHTML = topContent.innerHTML; // Copy the updated innerHTML to reflection
    }

    initialMirrorContent();

    // Function to create and link a reflection node
    function createReflectionNode(originalNode) {
        const clonedNode = originalNode.cloneNode(true);
        const nodeId = `node-${nodeIdCounter++}`; // Generate a unique ID for the node
        originalNode.setAttribute('data-node-id', nodeId);
        clonedNode.setAttribute('data-node-id', nodeId); // Set the same ID on the reflection node
        return clonedNode;
    }

    function applyChanges(mutations) {
        mutations.forEach(mutation => {
            const reflection = document.getElementById('reflection');
            // Handling added nodes
            mutation.addedNodes.forEach(node => {
                const clonedNode = createReflectionNode(node);
                const parentId = mutation.target.getAttribute('data-node-id');
                if(parentId){
                    const reflectionParent = reflection.querySelector(`[data-node-id="${parentId}"]`);
                    if (mutation.nextSibling) {
                        const nextSiblingId = mutation.nextSibling.getAttribute('data-node-id');
                        const nextSibling = reflection.querySelector(`[data-node-id="${nextSiblingId}"]`);
                        reflectionParent.insertBefore(clonedNode, nextSibling);
                    }
                    else {
                        reflectionParent.appendChild(clonedNode);
                    }
                }
                else {
                    document.body.appendChild(clonedNode);
                }
            });

            // Handling removed nodes
            mutation.removedNodes.forEach(node => {
                const nodeId = node.getAttribute('data-node-id');
                const reflectionNode = reflection.querySelector(`[data-node-id="${nodeId}"]`);
                if (reflectionNode && reflectionNode.parentNode) {
                    reflectionNode.parentNode.removeChild(reflectionNode);
                }
            });

            // Handling attribute changes
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    const nodeId = mutation.target.getAttribute('data-node-id');
                    const reflectionNode = reflection.querySelector(`[data-node-id="${nodeId}"]`);
                    if (reflectionNode) {
                        reflectionNode.setAttribute(mutation.attributeName, mutation.target.getAttribute(mutation.attributeName));
                    }
                }
            });
        });
    }

    const observer = new MutationObserver(applyChanges);
    observer.observe(topContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
    });
});


document.querySelector('.left-arrow').addEventListener('click', function() {
    haikuIndex = mod((haikuIndex - 1), haikuListLength);
    loadHaiku();
});

document.querySelector('.right-arrow').addEventListener('click', function() {
    haikuIndex = mod((haikuIndex + 1), haikuListLength);
    loadHaiku();
});

document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    body.classList.toggle('dark-mode');
    toggleButton.classList.toggle('active');
});
