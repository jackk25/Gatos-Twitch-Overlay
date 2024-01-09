const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

async function getToken(){
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });

    const json = await response.json();
    if (json.status != 401 && json.status != 400){
        return json.access_token;
    }
}

module.exports = { getToken };