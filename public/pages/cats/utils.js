function getEmoteURL(emoteID) {
    return `https://static-cdn.jtvnw.net/emoticons/v2/${emoteID}/default/light/3.0`
}

const emojiRegex = /https:\/\/static-cdn\.jtvnw\.net\/emoticons\/v2\/.*\/default\/light\/3\.0/

export { getEmoteURL, emojiRegex }
