//Get all the chatEntities from the DOM and store them in a variable
var chatEntities = document.getElementsByClassName("chatEntity");
var zIndex = 1;
var socket = io();

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

socket.on("chat", function (data) {
    console.log(data);
    mainChat(data.text, data.username, data.userColor);
});