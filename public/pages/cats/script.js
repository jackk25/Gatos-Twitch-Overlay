//Get all the chatEntities from the DOM and store them in a variable
var chatEntities = document.getElementsByClassName("chatEntity");
var zIndex = 1;
var socket = io();
import { getEmoteURL, emojiRegex } from "./utils.js";

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

function mainChat(chatText, username, userColor, tags) {
    var randomChatEntity = selectChatEntity();
    randomChatEntity.style.zIndex = zIndex;
    zIndex++;
    const speechBubble = randomChatEntity.children[0];

    console.log(speechBubble.childNodes);

    const userText = speechBubble.children[0];
    const chatDisplay = speechBubble.children[1];

    console.log(chatDisplay);

    speechBubble.style.display = "block";

    userText.textContent = username + ": ";
    userText.style.color = userColor;

    chatDisplay.innerHTML = "";

    console.log(tags);

    const emotes = tags["emotes"];

    if (emotes != null) {
        console.log(emotes)
        var splitChat = chatText.split('');
        for (const emote in emotes) {
            if (emotes.hasOwnProperty(emote)) {
                var emoteURL = getEmoteURL(emote);
                var positions = emotes[emote];
                positions.forEach(position => {
                    const positionArray = position.split("-")
                    var start = positionArray[0]
                    var end = positionArray[1]++;
                    for(var i = start; i <= end; i++){
                        splitChat[i] = null
                    }
                    splitChat[start] = emoteURL;
                });
            }
        }
        const filteredChat = splitChat.filter((element) => element != null);
        console.log(filteredChat);
        var tempStr = "";
        filteredChat.forEach(char => {
            //This character is actually an emote
            if(emojiRegex.test(char)){
                console.log("Emote found!");
                const text = document.createElement('p');
                const textContent = document.createTextNode(tempStr);   
                text.appendChild(textContent);
                chatDisplay.appendChild(text);

                const img = document.createElement('img');
                img.src = char;
                img.style.height = '2em';
                chatDisplay.appendChild(img);
                tempStr = "";
            } else {
                console.log("Nothing found!");
                console.log(char);
                tempStr += char;
            }
        });
        const text = document.createElement('p');
        const textContent = document.createTextNode(tempStr);   
        text.appendChild(textContent);
        chatDisplay.appendChild(text);
    } else {
        const text = document.createElement('p');
        const textContent = document.createTextNode(chatText);
        text.appendChild(textContent);
        chatDisplay.appendChild(text);
    }

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

socket.on("chat", function (data) {
    console.log(data);
    mainChat(data.text, data.username, data.userColor, data.allTags);
});

socket.on("config", function(data) {
    console.log("Changing font size!")
    console.log(data.newSize);

    var speechBubbles = document.getElementsByClassName("speechBubble")
    for(const bubble of speechBubbles){
        bubble.style.fontSize = `${data.newSize}px`
        console.log(bubble.style.fontSize);
    }
});