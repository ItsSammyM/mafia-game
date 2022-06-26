import PubNub from "pubnub"
import { GameManager } from "./GameManager";

export class PubNubWrapper{
    constructor(){
        this.pubnub = new PubNub({
            publishKey : "pub-c-f6860906-b4ba-4702-8e65-2b88b0026fdf",
            subscribeKey : "sub-c-253627e6-df37-4bd4-ba07-57e843d14d3d",
            uuid: Date.now().toString() + " " + GameManager.generateRandomString(5)
        });
    }
    createPayload(msgChannel, msgType, contents){
        return(
            {
                channel : msgChannel,
                message: {
                    type: msgType,
                    contents: contents
                }
            }
        );
    }
    publish(publishPayload){
        this.pubnub.publish(publishPayload, function(status, response) {
            //console.log("Sending " + publishPayload.message.type);
            // console.log(status, response);
            // console.log(publishPayload);
        });
    };
    createAndPublish(msgChannel, msgType, contents){
        this.publish(this.createPayload(msgChannel, msgType, contents));
    }
    subscribe(channel){
        this.pubnub.subscribe({
            channels: [channel]
        });
    }
    addMsgListener(func){
        this.pubnub.addListener({
            message: (m) => func(m)
        });
    }
}