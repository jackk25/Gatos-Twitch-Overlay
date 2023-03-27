const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const fs = require('fs');
const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const fetch = require('node-fetch');
const { parseMessage } = require("./parser");
//require('dotenv').config();

const params = new URLSearchParams();
params.append('client_id', process.env.client_id);
params.append('client_secret', process.env.client_secret);
params.append('code', process.env.code);
params.append('grant_type', 'authorization_code');
params.append('redirect_uri', "http://localhost:3000");

for(var k in process.env){
    console.log(k);
}

var accessToken = null;
console.log(process.env.client_id);

async function init(dst) {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            code: process.env.code,
            grant_type: 'authorization_code',
            redirect_uri: "http://localhost:3000"
        })
    });
    const json = await response.json();
    console.log(json);
    if (json.status != 401 && json.status != 400) {
        if (accessToken == null) {
            accessToken = json.access_token;
        }
        main("overlay", dst, accessToken);
    } else {
        console.log("refreshing token");
        refresh(dst);
    }
}

async function refresh(dst) {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.client_id,
            client_secret: process.env.client_secret,
            grant_type: 'refresh_token',
            refresh_token: process.env.refresh_token
        })
    });
    const json = await response.json();
    accessToken = json.access_token;
    main("overlay", dst, accessToken);
}

function main(user, dst, accessToken) {
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function (connection) {
        connection.send("CAP REQ :twitch.tv/commands twitch.tv/tags");
        connection.send(`PASS oauth:${accessToken}`);
        connection.send(`NICK ${user}`);
        connection.send(`JOIN #${dst}`);

        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });

        connection.on('close', function () {
            console.log('Connection Closed');
            console.log(`close description: ${connection.closeDescription}`);
            console.log(`close reason code: ${connection.closeReasonCode}`);
        });

        connection.on('message', function (ircMessage) {
            if (ircMessage.type === 'utf8') {
                let rawIrcMessage = ircMessage.utf8Data.trimEnd();

                let messages = rawIrcMessage.split('\r\n');  // The IRC message may contain one or more messages.
                messages.forEach(message => {
                    let parsedMessage = parseMessage(message);

                    if (parsedMessage) {
                        switch (parsedMessage.command.command) {
                            case 'PRIVMSG':
                                io.emit('chat', {
                                    text: parsedMessage.parameters,
                                    username: parsedMessage.tags['display-name'],
                                    userColor: parsedMessage.tags['color'],
                                })

                                break;
                            case 'PING':
                                connection.sendUTF('PONG ' + parsedMessage.parameters);
                                break;
                            default:
                                ;
                        }
                    }
                });
            }
        });
    });
    client.connect('ws://irc-ws.chat.twitch.tv:80');
}

init("mp_pocketninja");
const port = 3000;

app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.send(fs.readFileSync('/home/ec2-user/gatoTwitchOverlay/index.html', 'utf8'));
});

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});