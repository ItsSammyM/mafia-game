export class ChatState{
    constructor(title, playerNames = []){
        this.title = title;
        this.playerNames = playerNames;
        this.chatMessages = [];
    }
}
export class ChatMessageState{
    constructor(senderName, time, text="", type="msg"){
        this.senderName = senderName;
        this.type = type;
        this.text = text;
        this.time = time;
    }
}