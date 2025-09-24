class TypingAnimation extends HTMLElement {
    constructor() {
        super();
        this.texts = [
            "Welcome to my portfolio!"
        ];
        this.currentTextIndex = 0;
        this.currentIndex = 0;
        this.typingText = "";
        this.speed = 100; // Speed of typing (milliseconds per character)
        console.log("TypingAnimation element created");
    }

    connectedCallback() {
        console.log("Custom element connected!");
        this.attachShadow({ mode: "open" }); // Attach shadow DOM to the element
        // Shadow DOM structure with styles and container for the typing effect
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    font-weight: normal;
                    color: black;
                }
                .typing {
                    white-space: nowrap;
                    overflow: hidden;
                    border-right: 3px solid white;
                    padding-right: 5px;
                    animation: blink 0.7s infinite;
                }
                .highlight {
                    color: red;
                }
                @keyframes blink {
                    50% { border-color: transparent; }
                }
            </style>
            <div class="typing"></div>
        `;
        // Select the typing container from the shadow DOM
        this.typingElement = this.shadowRoot.querySelector(".typing");
        if (!this.typingElement) {
            console.error("Typing element not found!");
            return;
        }
        // Start the typing effect
        this.typeEffect();
    }

    // Typing effect
    typeEffect() {
        if (!this.typingElement) return;

        // Continue typing until the entire current text is written
        if (this.currentIndex < this.texts[this.currentTextIndex].length) {
            const currentChar = this.texts[this.currentTextIndex][this.currentIndex];

            // Create a text node for regular text and a span for highlighted text
            let node;

            if (this.texts[this.currentTextIndex].includes("web and software development") && this.currentIndex >= this.texts[this.currentTextIndex].indexOf("web and software development") && this.currentIndex < this.texts[this.currentTextIndex].indexOf("web and software development") + "web and software development".length) {
                node = document.createElement('span');
                node.className = 'highlight';
                node.textContent = currentChar;
            } else if (this.texts[this.currentTextIndex].includes("cybersecurity") && this.currentIndex >= this.texts[this.currentTextIndex].indexOf("cybersecurity") && this.currentIndex < this.texts[this.currentTextIndex].indexOf("cybersecurity") + "cybersecurity".length) {
                node = document.createElement('span');
                node.className = 'highlight';
                node.textContent = currentChar;
            } else {
                node = document.createTextNode(currentChar);
            }

            this.typingElement.appendChild(node); // Append the node to the element
            this.currentIndex++;

            setTimeout(() => this.typeEffect(), this.speed); // Wait and type the next character
        }
    }
}

// Define the custom element
console.log("Defining custom element...");
customElements.define("typing-animation", TypingAnimation);
console.log("Custom element defined!");
