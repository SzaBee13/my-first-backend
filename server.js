const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3000 });

server.on("connection", socket => {
    console.log("Új kapcsolat!");

    socket.on("message", message => {
        const data = JSON.parse(message.toString()); // JSON-ként olvassuk be az üzenetet
        console.log(`Üzenet érkezett (${data.author}): ${data.text}`);

        // Visszaküldjük az üzenetet az összes kliensnek
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    author: data.author,
                    text: data.text
                }));
            }
        });
    });

    socket.send(JSON.stringify({ author: "Server", text: "Welcome, you joined to the server!" }));
});
