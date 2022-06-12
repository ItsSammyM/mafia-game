export class ChatState{
    constructor(title){
        this.title = title;
        this.playerName = [];
        this.chatMessages = [];
    }
}
export class ChatMessageState{
    constructor(senderName, text){
        this.senderName = senderName;
        this.text = text;
    }
}