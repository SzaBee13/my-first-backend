const chat = document.getElementById("messages");
const input = document.getElementById("input");
const fullScreenDiv = document.getElementById("fullscreen");
const nicknameInput = document.getElementById("nickname");
const usernameInput = document.getElementById("username");
const answerDiv = document.getElementById("anwser");
const lsUsername = localStorage.getItem("username");
const lsNickname = localStorage.getItem("nickname");

// const socket = new WebSocket("http://192.168.126.1:3000");
const socket = new WebSocket("https://chat-szb.pagekite.me");

let username;
let nickname;

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log(`new: ${data.username} ${data.text}`)

    if (data.type === "message") {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");

        const authorSpan = document.createElement("span");
        authorSpan.classList.add("author");
        authorSpan.textContent = `${data.nickname}: `; // Only display the nickname

        const textSpan = document.createElement("span");
        textSpan.textContent = data.text;
        textSpan.classList.add("messageContent");

        messageDiv.appendChild(authorSpan);
        messageDiv.appendChild(textSpan);
        chat.appendChild(messageDiv);
    }
    if (data.type === "onlineCount") {
        document.getElementById("online").innerHTML = data.count;

    }
    if (data.type === "register") {
        if (data.success) {
            localStorage.setItem("username", username);
            localStorage.setItem("nickname", nickname);
            fullScreenDiv.style.display = "none";
        } else {
            answerDiv.textContent = data.message;
        }
    }
};

const sendMessage = () => {
    const message = input.value;
    if (!message) return;

    socket.send(JSON.stringify({ type: "message", username, nickname, text: message }));
    input.value = "";
};

const registerUser = () => {
    username = usernameInput.value;
    nickname = nicknameInput.value;

    const usernamePattern = /^[a-z0-9_-]+$/;

    if (!username) {
        answerDiv.textContent = "Username cannot be empty";
        return;
    }

    if (!usernamePattern.test(username)) {
        answerDiv.textContent = "Username can only contain lowercase letters, numbers, '-', and '_'";
        return;
    }

    socket.send(JSON.stringify({ type: "register", username, nickname }));
};

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        console.log('Shift + Enter pressed');
    } else if (event.key === 'Enter') {
        sendMessage();
    }
});

usernameInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        registerUser();
    }
});

const init = () => {
    if (lsUsername) {
        fullScreenDiv.style.display = "none";
        username = lsUsername;
        nickname = lsNickname;
    } else {
        fullScreenDiv.style.display = "flex";
    }
};

init();