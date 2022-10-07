import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString } from "./functions"
import { PlayerState } from "../gameStateHost/PlayerState";
import { PlayerStateClient } from "../gameStateClient/PlayerStateClient";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { MainMenu } from "../menu/MainMenu";
import { ChatMessageStateClient } from "../gameStateClient/ChatMessageStateClient";
import { ChatMessageState } from "../gameStateHost/ChatMessageState";

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
        this.receiveListeners = []; //list of functions
        this.toClient = toClient;
        this.send = send;
        this.receive = (c)=>{
            for(let i = 0; i < this.receiveListeners.length; i++){
                this.receiveListeners[i].listener(c);
            }
            recieve(c);
        };
        MessageType.idCounter++;
    }
    addReceiveListener(l){
        this.receiveListeners.push(l);
    }
    removeReceiveListener(l){
        for(let i = 0; i < this.receiveListeners.length; i++){
            if(this.receiveListeners[i] === l){
                this.receiveListeners.splice(i);
                return;
            }
        }
    }
}

let GameManager = {
    pubNub : new PubNubWrapper(),
    host : {
        isHost : false,
        roomCode : "",
        players : [],
        gameStarted : false,

        start : function(){
            GameManager.host.gameStarted = true;

            let informationList = [];
            informationList.push(new ChatMessageState("NoTitle", "All Player"))
            let playerIndividualInformationList = [];
            for(let i = 0; i < GameManager.host.players.length; i++){

                playerIndividualInformationList.push({
                    name : GameManager.host.players[i].name,
                    informationList : (()=>{
                        return [new ChatMessageState("NoTitle", "Single message sent just to you")]
                    })()
                });
            }

            GameManager.HOST_TO_CLIENT["START_GAME"].send(
                GameManager.host.players.map((p)=>{return p.name}),
                playerIndividualInformationList,
                informationList
            );
        },
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

        players : [],
        information : [],

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
        "BUTTON_TARGET":new MessageType(false,
            /**
             * 
             * @param {String} playerName 
             * @param {array[String]} targetingList 
             */
            (playerName, targetingList)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_TARGET"], {
                playerName: playerName,
                targetingList: targetingList
            })},
            (contents)=>{
                
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
                }
            }
        ),
        "START_GAME":new MessageType(true, 
            /**
             * 
             * @param {array[string]} allPlayerNames 
             * @param {Object} playerIndividual - {
             *  name : {string}
             *  informationList : {array[ChatMessageState]}
             * }
             * @param {array[ChatMessageStateClient]} informationList
             */
            (allPlayerNames, playerIndividual, informationList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_GAME"], {
                playerIndividual  : playerIndividual,
                allPlayerNames: allPlayerNames,
                informationList: informationList,
            })},
            (contents)=>{
                for(let i = 0; i < contents.allPlayerNames.length; i++){
                    GameManager.client.players.push(new PlayerStateClient(contents.allPlayerNames[i]));
                }

                for(let i = 0; i < contents.informationList.length; i++){
                    GameManager.client.information.push(new ChatMessageStateClient(contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color));
                }
                //individual
                let player = null;
                for(let i = 0; i < contents.playerIndividual.length; i++){
                    if (GameManager.client.playerName === contents.playerIndividual[i].name){
                        player = contents.playerIndividual[i];
                        break;
                    }
                }

                if(player === null)
                    alert("Error, GameManager- START_GAME_RECIEVE");

                for(let i = 0; i < player.informationList.length; i++){
                    GameManager.client.information.push(new ChatMessageStateClient(player.informationList[i].title, player.informationList[i].text, player.informationList[i].color));
                }
                Main.instance.changeMenu(<MainMenu/>);
            }
        ),
        "PHASE_START":new MessageType(true,
            ()=>{},
            (contents)=>{}
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
