const chat = document.getElementById("messages")
const input = document.getElementById("input")
const fullScreenDiv = document.getElementById("fullscreen")
const authorInput = document.getElementById("author")
const lsAuthor = localStorage.getItem("author")

const socket = new WebSocket("https://my-first-backend-production.up.railway.app");

let author;

socket.onmessage = event => {
    const data = JSON.parse(event.data); // JSON formátumban érkező üzenet feldolgozása

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const authorSpan = document.createElement("span");
    authorSpan.classList.add("author");
    authorSpan.textContent = `${data.author}: `;

    const textSpan = document.createElement("span");
    textSpan.textContent = data.text;
    textSpan.classList.add("messageContent")

    messageDiv.appendChild(authorSpan);
    messageDiv.appendChild(textSpan);
    chat.appendChild(messageDiv);
};

function sendMessage() {
    const message = input.value;
    if (!message) return;

    socket.send(JSON.stringify({ author, text: message }));
    input.value = "";
}

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        console.log('Shift + Enter pressed');
        // Add your logic for Shift + Enter here
    } else if (event.key === 'Enter') {
        sendMessage()
    }
});

authorInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        author = authorInput.value;
        localStorage.setItem("author", author);
        fullScreenDiv.style.display = "none";
        
    }
});

const init = () => {
    if (lsAuthor) {
        fullScreenDiv.style.display = "none"
        author = lsAuthor;
    } else {
        fullScreenDiv.style.display = "flex"
    }
}

init()