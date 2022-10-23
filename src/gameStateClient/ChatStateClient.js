export class ChatStateClient{
    constructor(_title){
        this.title = _title;
        this.notification = false; //weather to show notification
        this.allMessages = [];
        this.updateListeners = [];
    }
    addMessage(chatMessaage){
        this.allMessages.push(chatMessaage);
        this.notification = true;
        this.invokeUpdateListeners();
    }
    addMessages(chatMessages){
        this.allMessages = this.allMessages.concat(chatMessages);
        this.notification = true;
        this.invokeUpdateListeners();
    }
    checkChat(){
        this.notification = false;
    }
    addUpdateListener(l){
        this.updateListeners.push(l);
    }
    removeUpdateListener(l){
        for(let i = 0; i < this.updateListeners.length; i++){
            if(this.updateListeners[i] === l){
                this.updateListeners.splice(i);
                return;
            }
        }
    }
    invokeUpdateListeners(){
        for(let i = 0; i < this.updateListeners.length; i++){
            if(this.updateListeners[i])
                this.updateListeners[i].listener();
        }
    }
}