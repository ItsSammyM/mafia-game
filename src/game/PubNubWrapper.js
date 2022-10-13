import PubNub from "pubnub"
import { generateRandomString } from "./functions";

/*
{
    channel : msgChannel,
    message : {
        toClient : toClient,
        type: msgType,
        contents: contents
    }
}
*/

export class PubNubWrapper{
    constructor(){
        this.pubnub = new PubNub({
            publishKey : "pub-c-f6860906-b4ba-4702-8e65-2b88b0026fdf",
            subscribeKey : "sub-c-253627e6-df37-4bd4-ba07-57e843d14d3d",
            uuid: Date.now().toString() + " " + generateRandomString(5)
        });
        this.subscribedChannels = []
        this.messagesToSend = []; //list of publishPayloads to send 1 time per tick
        

        this.realListener = {
            message : (m)=>{
                for(let key in this.listeners){
                    this.listeners[key](m);
                }
            },
        };
        this.listeners = {};
        this.pubnub.addListener(this.realListener);
    }
    static createMessage(_toClient, _typeId, _contents){
        return(
            {
                toClient : _toClient,
                typeId: _typeId,
                contents: _contents
            }
        );
    }
    static createPayload(_channel, toClient, typeId, contents){
        return(
            {
                channel : _channel,
                message: PubNubWrapper.createMessage(toClient, typeId, contents)
            }
        );
    }
    tick(){
        if(this.messagesToSend.length <= 0) return;
        let publishPayload = this.messagesToSend.shift();
        this.pubnub.publish(publishPayload, function(status, response) {
            //console.log("Sending " + publishPayload.message.type);
            // console.log(status, response);
            // console.log(publishPayload);
        });
        
    }
    publish(publishPayload){
        this.messagesToSend.push(publishPayload);
        // this.pubnub.publish(publishPayload, function(status, response) {
        //     //console.log("Sending " + publishPayload.message.type);
        //     // console.log(status, response);
        //     // console.log(publishPayload);
        // });
    };
    createAndPublish(msgChannel, toClient, msgTypeId, contents){
        this.publish(PubNubWrapper.createPayload(msgChannel, toClient, msgTypeId, contents));
    }
    subscribe(channel){
        if(this.subscribedChannels.indexOf(channel) !== -1)
            return;
        this.subscribedChannels.push(channel);
        this.pubnub.subscribe({
            channels: [channel]
        });
    }
    unsubscribe(channel){
        this.pubnub.unsubscribe({
            channels: [channel]
        });
        let i = this.subscribedChannels.indexOf(channel);
        i !== -1 ? this.subscribedChannels.splice(i,1) : (()=>{})();
    }
    unsubscribeAll(){
        this.pubnub.unsubscribeAll();
        this.subscribedChannels = [];
    }
    addListener(func){
        
        // this.pubnub.addListener({
        //     message: (m) => func(m),
        // });
    }
    /**
     * adds a listener that only listens to messages sent to host
     * @param {function} func 
     */
    addHostListener(func){
        this.listeners["Host"] = func;
        // this.pubnub.addListener({
        //     message: (m) => {if(!m.message.toClient) func(m)},
            
        //     //status: (m) => {console.log(m)}
        // });
    }
    /**
     * adds a listener that only listens to messages sent to clients
     * @param {function} func 
     */
    addClientListener(func){
        this.listeners["Client"] = func;
        // this.pubnub.addListener({
        //     message: (m) => {if(m.message.toClient) func(m)},
            
        //     //status: (m) => {console.log(m)}
        // });
    }
}