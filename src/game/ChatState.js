export class ChatState{
    constructor(title, playerNames = []){
        this.title = title;
        this.playerNames = playerNames;
        this.restrictedPlayerNames = [];
        this.chatMessages = [];
    }
    addMessage(myName, text, type){
        this.chatMessages.push(new ChatMessageState(
            myName,
            Date.now(),
            text,
            type
        ));
    }
    restrictAll(){
        this.restrictedPlayerNames = this.playerNames.slice();
    }
    unrestrictAll(){
        this.restrictedPlayerNames = [];
    }
    unrestrictPlayer(playerName){
        let i = this.restrictedPlayerNames.indexOf(playerName);
        if(i !== -1)
            this.restrictedPlayerNames.splice(i, 1);
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