import PubNubWrapper from "./PubNubWrapper"

export class GameManager{
    constructor(){
        this.pubNub = new PubNubWrapper();
        //this.pubNub.addMsgListener((m) => this.onMessage(m));
    }
}

