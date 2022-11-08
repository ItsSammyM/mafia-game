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

        this.channel = "";
        this.messagesToSendStreamBufferLength = 2;
        this.messagesToSendStream = []; //list of publishPayloads to send 1 time per tick
        
        this.realListener = {
            message : (m)=>{                
                for(let i = 0; i < m.message.length; i++){                    
                    for(let key in this.listeners){
                        this.listeners[key](m.message[i]);
                    }
                }
                
            },
        };
        this.listeners = {};
        this.pubnub.addListener(this.realListener);
    }
    static createMessage(_typeId, _contents){
        return(
            {
                typeId: _typeId,
                contents: _contents
            }
        );
    }
    tick(){
        if(this.messagesToSendStream.length <= 0) return;
        // console.log(this.messagesToSend)
        this.pubnub.publish(
            {
                channel : this.channel,
                message : this.messagesToSendStream.splice(0, this.messagesToSendStreamBufferLength),
            }, 
            function(status, response) {
                //console.log("Sending " + publishPayload.message.type);
                // console.log(status, response);
                // console.log(publishPayload);
            }
        );
        //this.messagesToSendStream = [];
    }
    publish(message){
        this.messagesToSendStream.push(message);
        
            
        // this.pubnub.publish(publishPayload, function(status, response) {
        //     //console.log("Sending " + publishPayload.message.type);
        //     // console.log(status, response);
        //     // console.log(publishPayload);
        // });
    };
    createAndPublish(toClient, msgTypeId, contents){
        this.publish(PubNubWrapper.createMessage(toClient, msgTypeId, contents));
    }
    subscribe(channel){
        this.channel = channel;
        this.pubnub.subscribe({
            channels: [channel]
        });
    }
    unsubscribe(){
        this.pubnub.unsubscribeAll();
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