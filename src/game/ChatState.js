export class ChatState{
    constructor(title, playerNames = []){
        this.title = title;
        this.playerNames = playerNames;
        this.chatMessages = [];
    }
}
export class ChatMessageState{
    constructor(senderName, time, text="", will=false){
        this.senderName = senderName;
        this.text = text;
        this.will = will;
        this.time = time;
    }
}