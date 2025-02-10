const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3000 });
const usernames = new Set();

let onlines = 0;

server.on("connection", socket => {
    console.log("Új kapcsolat!");
    onlines += 1;

    socket.on("message", message => {
        const data = JSON.parse(message.toString());

        if (data.type === "register") {
            if (usernames.has(data.username)) {
                socket.send(JSON.stringify({ type: "register", success: false, message: "Username already taken" }));
            } else {
                usernames.add(data.username);
                socket.username = data.username;
                socket.send(JSON.stringify({ type: "register", success: true, message: "Registration successful" }));
                broadcastOnlineCount();
            }
        } else if (data.type === "message") {
            console.log(`Üzenet érkezett (${data.username}): ${data.text}`);
            broadcastMessage(data.username, data.nickname, data.text);
        }
    });

    socket.on("close", () => {
        onlines -= 1
    });

    const broadcastMessage = (username, nickname,text) => {
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "message",
                    username: username,
                    nickname: nickname,
                    text: text
                }));
            }
        });
    };

    const broadcastOnlineCount = () => {
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "onlineCount", count: onlines }));
            }
        });
    };

    broadcastOnlineCount()
    broadcastMessage("server", "Server", "Welcome, you joined to the server!")
});