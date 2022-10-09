import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString } from "./functions"
import { PlayerState } from "../gameStateHost/PlayerState";
import { PlayerStateClient } from "../gameStateClient/PlayerStateClient";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { MainMenu } from "../menu/MainMenu";
import { ChatMessageStateClient } from "../gameStateClient/ChatMessageStateClient";
import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import { getRandomRole, ROLES } from "./ROLES";
import { PhaseStateMachine } from "./PHASE";

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
            recieve(c);
            for(let i = 0; i < this.receiveListeners.length; i++){
                this.receiveListeners[i].listener(c);
            }
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
    tick : function(){
        
        this.pubNub.tick();
        if(GameManager.host) GameManager.host.tick();
        if(GameManager.client) GameManager.client.tick()
        setTimeout(()=>{
            GameManager.tick();
        },300)
    },
    host : {
        isHost : false,
        roomCode : "",
        players : [],
        gameStarted : false,

        startGame : function(){
            GameManager.host.gameStarted = true;

            let informationList = [];
            let playerIndividual = {};

            informationList.push(new ChatMessageState("NoTitle", "All Player"));

            for(let i = 0; i < GameManager.host.players.length; i++){

                GameManager.host.players[i].createPlayerRole(getRandomRole("Random", "Random"));

                playerIndividual[GameManager.host.players[i].name] = {
                    informationList : (()=>{
                        return [new ChatMessageState(GameManager.host.players[i].role.persist.roleName, ROLES[GameManager.host.players[i].role.persist.roleName].basicDescription)];
                    })(),
                };   
            }

            GameManager.HOST_TO_CLIENT["START_GAME"].send(
                GameManager.host.players.map((p)=>{return p.name}),
                playerIndividual,
                informationList,
            );

            PhaseStateMachine.startPhase("Night");
            
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
        tick : function(){
            
            PhaseStateMachine.tick();
        }
    },
    client : {
        roomCode : "",
        playerName : "",

        phase: "",

        players : [],
        information : [],
        availableButtons : {},

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
        tick : function(){

        }
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
             * @param {Array[String]} allPlayerNames 
             * @param {Object} playerIndividual - {
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
                console.log("RECIEVED H2C START_GAME");
                for(let i = 0; i < contents.allPlayerNames.length; i++){
                    GameManager.client.players.push(new PlayerStateClient(contents.allPlayerNames[i]));
                }

                for(let i = 0; i < contents.informationList.length; i++){
                    GameManager.client.information.push(new ChatMessageStateClient(contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color));
                }
                //individual
                let player = contents.playerIndividual[GameManager.client.playerName];

                if(player===undefined||player===null) return;
                for(let i = 0; i < player.informationList.length; i++){
                    GameManager.client.information.push(new ChatMessageStateClient(player.informationList[i].title, player.informationList[i].text, player.informationList[i].color));
                }
                Main.instance.changeMenu(<MainMenu/>);
            }
        ),
        "START_PHASE":new MessageType(true,
            /**
             * 
             * @param {String} newPhase 
             * @param {Object} playerIndividual - {
             *  informationList : [Array[ChatMessageState]]
             *  availableButtons : Object
             *      "Name":{
             *          type : {"Target", "Vote", "Whisper"}
             *      }
             * }
             * @param {Array[ChatMessageState]} informationList 
             */
            (phaseName, playerIndividual, informationList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_PHASE"], {
                phaseName : phaseName,
                playerIndividual : playerIndividual,
                informationList : informationList,
            })},
            (contents)=>{
                console.log("H2C START_PHASE");
                GameManager.client.phase = contents.phaseName;

                if(contents.informationList){
                    for(let i = 0; i < contents.informationList.length; i++){
                        GameManager.client.information.push(new ChatMessageStateClient(contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color));
                    }
                }

                GameManager.client.availableButtons = {};
                if(contents.playerIndividual){
                    //individual
                    let player = contents.playerIndividual[GameManager.client.playerName];
                    if(player!==undefined&&player!==null){
                        for(let i = 0; i < player.informationList.length; i++){
                            GameManager.client.information.push(new ChatMessageStateClient(player.informationList[i].title, player.informationList[i].text, player.informationList[i].color));
                        }
                    }

                    if(player && player.availableButtons)
                        GameManager.client.availableButtons = player.availableButtons;
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
