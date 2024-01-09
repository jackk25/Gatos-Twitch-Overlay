import { getEmoteURL, emojiRegex } from "./utils.js";

var socket = io();
const mainDiv = document.getElementById('main')

function createTextBox(classList, textValue=null) {
    const parent = document.createElement('div');
    
    parent.classList.add("roundedEdges");
    parent.classList.add(classList);

    if(textValue != null){
        const childParagraph = document.createElement('p');
        const textContent = document.createTextNode(textValue); 
        childParagraph.appendChild(textContent);   
        parent.appendChild(childParagraph);
    }

    return parent;
}

function mainChat(chatText, username, userColor, tags) {
    const newChat = document.createElement('div')
    newChat.classList.add("chatEntry")

    const nameText = createTextBox("usernameBox", `${username}:`);
    nameText.style.color = userColor;
    const chatDisplay = createTextBox("chatBox");

    newChat.appendChild(nameText);
    newChat.appendChild(chatDisplay);
    mainDiv.appendChild(newChat);

    const emotes = tags["emotes"];

    console.log(emotes)

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

}

socket.on("chat", function (data) {
    mainChat(data.text, data.username, data.userColor, data.allTags);
});

socket.on("config", function (data) {
    console.log("Changing font size!")
    console.log(data.newSize);
});