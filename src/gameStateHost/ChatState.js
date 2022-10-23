export class ChatState{
    constructor(_title){
        this.title = _title;
        this.allMessages = [];
    }
    addMessage(chatMessaage){
        this.allMessages.push(chatMessaage);
    }
    addMessages(chatMessages){
        this.allMessages = this.allMessages.concat(chatMessages);
    }
}