const express = require('express');
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server)
const path = require('path');
const fs = require('fs')
const tmi = require('tmi.js');
const eventSub = require('./eventSub');

const tmiClient = new tmi.Client({
    channels: ['mp_pocketninja']
});

function adjustConfig(message, tags){
    const fontSize = /!setFontSize [0-9]+/
    if(fontSize.test(message)) {
        console.log(/[0-9]+/.exec(message)[0]);
        io.emit('config', {
            newSize: /[0-9]+/.exec(message)[0]
        })
    }
}

function isValidChat(message, tags){
    blocked_users = ["blerp", "Streamelements", "smart_fridge_vasf07"]
    blocked_prefixes = ["!", "/", "http"]
    username = tags.username;
    if(blocked_users.includes(username)){
        return false
    }
    if (testPrefix(message, blocked_prefixes)) {
        return false
    }
    return true
}


function testPrefix(message, blocked_prefixes){
    //Format the message
    message = message.toLowerCase().trim()
    for (var prefix in blocked_prefixes){
        prefix = blocked_prefixes[prefix];
        if (message.startsWith(prefix)) {
            return true
        }
    }
    return false
}


tmiClient.connect();

tmiClient.on('message', (channel, tags, message, self) => {
    console.log(tags)
    if(isValidChat(message, tags)){
        io.emit('chat', {
            text: message,
            username: tags.username,
            userColor: tags.color,
            allTags: tags
        });
    }
});

const port = 3000;

console.log(eventSub.getToken());

app.use('/public', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.send(fs.readFileSync('public/pages/cats/index.html', 'utf8'));
});

app.get('/normal', (req, res) => {
    res.send(fs.readFileSync('public/pages/regular/index.html', 'utf8'));
});

app.get('/cats', (req, res) => {
    res.send(fs.readFileSync('public/pages/cats/index.html', 'utf8'));
});

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
