import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString } from "./functions"
import { PlayerState } from "../gameState/PlayerState";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { StartMenu } from "../menu/StartMenu";

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
        this.ID = MessageType.idCounter;
        this.toClient = toClient;
        this.send = send;
        this.receive = recieve;
        MessageType.idCounter++;
    }
}

let GameManager = {
    pubNub : new PubNubWrapper(),
    host : {
        isHost : false,
        roomCode : "",
        players : [],
        gameStarted : false,

        create : function(){
            GameManager.host.isHost = true;
            GameManager.host.roomCode = generateRandomString(4);
            GameManager.pubNub.subscribe(GameManager.host.roomCode);

            GameManager.pubNub.addHostListener((m)=>{
                for(const key in GameManager.CLIENT_TO_HOST){
                    if(GameManager.CLIENT_TO_HOST[key].ID !== m.message.typeId)
                        continue;
                    GameManager.CLIENT_TO_HOST[key].receive(m.message.contents);
                }
            });
        },
        sendMessage: function(messageType, contents){
            GameManager.pubNub.createAndPublish(GameManager.host.roomCode, true, messageType.ID, contents)
        },
    },
    client : {
        roomCode : "",
        playerName : "",
        create: function(_roomCode, _playerName){
            GameManager.client.roomCode = _roomCode;
            GameManager.client.playerName = _playerName;
            GameManager.pubNub.subscribe(_roomCode);

            GameManager.pubNub.addClientListener((m)=>{
                for(const key in GameManager.HOST_TO_CLIENT){
                    if(GameManager.HOST_TO_CLIENT[key].ID !== m.message.typeId)
                        continue;
                    GameManager.HOST_TO_CLIENT[key].receive(m.message.contents);
                }
            });

            GameManager.CLIENT_TO_HOST["ASK_JOIN"].send(_playerName);
        },
        sendMessage: function(messageType, contents){
            GameManager.pubNub.createAndPublish(GameManager.client.roomCode, false, messageType.ID, contents)
        },
    },
    CLIENT_TO_HOST:{
        "ASK_JOIN":new MessageType(false,
            (playerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["ASK_JOIN"], {
                playerName: playerName
            })},
            (contents)=>{
                if(!GameManager.host.gameStarted){
                    let alreadyJoined = false
                    for(let i = 0; i < GameManager.host.players.length; i++){
                        if(GameManager.host.players[i].name === contents.playerName)
                            alreadyJoined = true;
                    }
                    if(!alreadyJoined) GameManager.host.players.push(new PlayerState(contents.playerName));
                    GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, true);
                }
                GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, false);
            }
        ),
    },
    HOST_TO_CLIENT:{
        "ASK_JOIN_RESPONSE":new MessageType(true, 
            (playerName, success)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"], {
                playerName: playerName,
                success: success
            })},
            (contents)=>{
                if(GameManager.host.isHost)
                    return;

                if(contents.success){
                    Main.instance.changeMenu(<WaitJoinMenu/>);
                }else{
                    Main.instance.changeMenu(<StartMenu/>);
                }
            }
        )
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

