//Get all the chatEntities from the DOM and store them in a variable
var chatEntities = document.getElementsByClassName("chatEntity");
var zIndex = 1;
var dstChannel = localStorage.getItem("targetChannel");

const debug = true;

function selectChatEntity() {
    //Get all of the chatEntities that are not disabled or active
    var availableChatEntities = Array.from(chatEntities).filter((chatEntity) => {
        return !chatEntity.classList.contains("disabled") && !chatEntity.classList.contains("active");
    });

    if (availableChatEntities.length == 0) {
        //Get all of the chatEntities that are disabled
        var disabledChatEntities = Array.from(chatEntities).filter((chatEntity) => {
            return !chatEntity.classList.contains("disabled");
        });

        //Get the chatEntity with the oldest timestamp
        var oldestChatEntity = disabledChatEntities.reduce(function (prev, current) {
            return (prev.getAttribute("data-timestamp") < current.getAttribute("data-timestamp") ? prev : current);
        });

        console.log("Oldest chatEntity: " + oldestChatEntity.classList[1]);
        return oldestChatEntity;
    }

    //Select a random chatEntity from the availableChatEntities array
    var randomChatEntity = availableChatEntities[Math.floor(Math.random() * availableChatEntities.length)];

    randomChatEntity.classList.add("active");
    return randomChatEntity;
}

function mainChat(chatText, username, userColor) {
    var randomChatEntity = selectChatEntity();
    randomChatEntity.style.zIndex = zIndex;
    zIndex++;
    const speechBubble = randomChatEntity.children[0];

    const userText = speechBubble.children[0];
    const chatDisplay = speechBubble.children[1];

    speechBubble.style.display = "block";

    userText.textContent = username + ": ";
    userText.style.color = userColor;
    chatDisplay.textContent = chatText;

    //generate a random number between 50 and 100
    var position = Math.floor(Math.random() * 50) + 50;
    randomChatEntity.style.transform = `translateY(-${position}px)`;

    //add a timestamp to the chatEntity's data attribute
    randomChatEntity.setAttribute("data-timestamp", Date.now());

    //wait 10 seconds
    setTimeout(function () {
        speechBubble.style.display = "none";
        randomChatEntity.style.transform = "translateY(0px)";
        randomChatEntity.classList.remove("active")
        randomChatEntity.removeAttribute("data-timestamp");
    }, 10000);
}

function connectToTwitch(user, dst) {
    const webSocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    const hash = window.location.hash;
    const accessToken = hash.split("=")[1].split("&")[0];

    webSocket.onopen = function () {
        webSocket.send("PASS oauth:" + accessToken);
        webSocket.send("NICK " + user);
        webSocket.send("JOIN #" + dst);
        webSocket.send("CAP REQ :twitch.tv/commands twitch.tv/tags")
    }
    return webSocket;
}

function main() {
    const socket = connectToTwitch(dstChannel, dstChannel);
    socket.onmessage = function (event) {
        //Check if the message is a chat message
        if (event.data.includes("PRIVMSG")) {
            const chatArray = event.data.split("PRIVMSG #");
            //Extract the chat message from the event data
            var chatData = chatArray[1];
            console.log(chatArray);
            const text = chatData.split(":")[1];

            //Extract the username from the chatArray, it is in the display-name tag
            var user = chatArray[0].split("display-name=")[1].split(";")[0];

            //Extract the user color from the event data
            var userColor = chatArray[0]
            //The user color starts after the "color=" string, and is a 6 digit hex code
            userColor = userColor.split("color=")[1].split(";")[0];
            if (!userColor) {
                userColor = "#DC143C";
            }
            //Send the chat message to the main chat function
            mainChat(text, user, userColor);
        }
        if (event.data.includes("PING")) {
            socket.send("PONG :tmi.twitch.tv");
        }
    }
}

function init() {
    if (!dstChannel) {
        dstChannel = prompt("Please enter the channel you want to connect to");
        dstChannel = dstChannel.toLowerCase();
        localStorage.setItem("targetChannel", dstChannel);
    }
}

init();

if (window.location.hash) {
    main();
} else {
    if(!debug) {
        console.log("not debug!");
        window.location.href = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=cvejqqmh71ma56bg5djjj4cmxefqt0&redirect_uri=https://d2baao21cgila9.cloudfront.net&scope=chat%3Aread';
    } else {
        console.log("debug");
        window.location.href = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=cvejqqmh71ma56bg5djjj4cmxefqt0&redirect_uri=http://localhost:3000&scope=chat%3Aread';
    }
}

const debugText = document.getElementById("chatText");
const debugButton = document.getElementById("send");
if (debug) {
    debugButton.addEventListener("click", function () {
        mainChat(debugText.value, "jack_xyz_", "#212EF5");
    });
} else {
    debugText.style.display = "none";
    debugButton.style.display = "none";
}
