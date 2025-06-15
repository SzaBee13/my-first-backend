const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Open (or create) the database
const db = new sqlite3.Database(path.join(__dirname, "usernames.db"));

// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY
)`);

const server = new WebSocket.Server({ port: 3100 });

let onlines = 0;

server.on("connection", socket => {
    console.log("Új kapcsolat!");
    onlines += 1;

    socket.on("message", message => {
        const data = JSON.parse(message.toString());

        if (data.type === "register") {
            // Check if username exists in DB
            db.get("SELECT username FROM users WHERE username = ?", [data.username], (err, row) => {
                if (err) {
                    socket.send(JSON.stringify({ type: "register", success: false, message: "DB error" }));
                    return;
                }
                if (row) {
                    socket.send(JSON.stringify({ type: "register", success: false, message: "Username already taken" }));
                } else {
                    // Insert new username
                    db.run("INSERT INTO users(username) VALUES(?)", [data.username], err => {
                        if (err) {
                            socket.send(JSON.stringify({ type: "register", success: false, message: "DB error" }));
                        } else {
                            socket.username = data.username;
                            socket.send(JSON.stringify({ type: "register", success: true, message: "Registration successful" }));
                            broadcastOnlineCount();
                        }
                    });
                }
            });
        } else if (data.type === "message") {
            if (!data.username) {
                socket.send(JSON.stringify({ type: "message", username: "server", nickname: "Server", text: "You must register first!" }));
                return;
            }
            if (!data.text || !data.username || !data.nickname) {
                socket.send(JSON.stringify({ type: "message", username: "server", nickname: "Server", text: "Invalid message format!" }));
                return;
            }

            console.log(`Üzenet érkezett (${data.username}): ${data.text}`);
            broadcastMessage(data.username, data.nickname, data.text);
        }
    });

    socket.on("close", () => {
        onlines -= 1;
        // Optionally, remove username from DB here if you want
    });

    const broadcastMessage = (username, nickname, text) => {
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

    socket.send(JSON.stringify({
        type: "message",
        username: "server",
        nickname: "Server",
        text: "Welcome, you joined to the server!"
    }));
});