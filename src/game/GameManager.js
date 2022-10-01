import { PubNubWrapper } from "./PubNubWrapper"
import {generateRandomString} from "./functions"
import { PlayerState } from "../gameState/PlayerState";

let GameManager = {
    pubNub : new PubNubWrapper(),
    host : null,
    client : null,
    /**
     * 
     * @returns roomCode
     */
    createHost : ()=>{
        let roomCode = generateRandomString(4);
        GameManager.pubNub.subscribe(roomCode);
        
        GameManager.host = {
            sendMessage: function(messageType, contents){
                GameManager.pubNub.createAndPublish(GameManager.host.roomCode, true, messageType.ID, contents)
            },
            roomCode : roomCode,
            players : []
        };

        GameManager.pubNub.addHostListener((m)=>{
            for(const key in GameManager.CLIENT_TO_HOST){
                if(GameManager.CLIENT_TO_HOST[key].ID !== m.message.typeId)
                    continue;
                GameManager.CLIENT_TO_HOST[key].receive(m.message.contents);
            }
        });
        return roomCode;
    },
    /**
     * 
     * @param {string} roomCode 
     */
    createClient : (roomCode)=>{
        GameManager.pubNub.subscribe(roomCode);

        GameManager.client = {
            sendMessage: function(messageType, contents){
                GameManager.pubNub.createAndPublish(GameManager.client.roomCode, false, messageType.ID, contents)
            },
            roomCode : roomCode,
        };

        GameManager.pubNub.addClientListener((m)=>{
            for(const key in GameManager.HOST_TO_CLIENT){
                if(GameManager.HOST_TO_CLIENT[key].ID !== m.message.typeId)
                    continue;
                GameManager.HOST_TO_CLIENT[key].receive(m.message.contents);
            }
        });
    },
    CLIENT_TO_HOST:{
        "ASK_JOIN":new MessageType(false,
            (playerName)=>{GameManager.host.sendMessage()},
            (c)=>{}
        )
    },
    HOST_TO_CLIENT:{

    }
};
/**
 * A type of message, with specified behaviors for how it should be sent and recieved
 */
class MessageType{
    /**
     * @param {boolean} toClient 
     * @param {function} send 
     * @param {function} recieve - should take 1 parameter that is contents of message
     */
    static idCounter = 1;
    constructor(toClient, send, recieve){
        this.ID = idCounter;
        this.toClient = toClient;
        this.send = send;
        this.receive = recieve;
        idCounter++;
    }
}
export default GameManager;

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

