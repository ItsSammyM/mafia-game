import { GameManager } from "./GameManager";

export class ChatState{
    constructor(title, playerNames = []){
        this.title = title;
        this.playerNames = playerNames;
        this.chatMessages = [];
    }
    addMessage(myName, text, type){
        this.chatMessages.push(new ChatMessageState(
            myName,
            Date.now(),
            text,
            type
        ));
        if(!GameManager.instance.completeState.myState.unreadChats.includes(this.title))
            GameManager.instance.completeState.myState.unreadChats.push(this.title);
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