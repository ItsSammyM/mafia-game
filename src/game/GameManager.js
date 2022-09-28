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
            roomCode : roomCode,
            players : []
        };

        GameManager.pubNub.addHostListener((m)=>{
            switch(m.message.type){
                case GameManager.CLIENT_TO_HOST_ENUM.JOIN.ID:
                    {
                        GameManager.CLIENT_TO_HOST_ENUM.JOIN.receive(m.message.contents);
                    }
                    break;
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
            roomCode : roomCode,
        };

        GameManager.pubNub.addClientListener((m)=>{
            switch(m.message.type){
                
            }
        });
    },

    CLIENT_TO_HOST_ENUM : {
        JOIN : {
            ID : 1,
            send : (playerName)=>{
                GameManager.pubNub.createAndPublish(GameManager.client.roomCode, false, GameManager.CLIENT_TO_HOST_ENUM.JOIN, {
                    playerName : playerName
                });
            },
            receive : (c)=>{
                GameManager.host.players.push(new PlayerState(c.playerName));
                //invokeStateUpdate()???
            }
        },
    },
    HOST_TO_CLIENT_ENUM : {

    }
};
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

