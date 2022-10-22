import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString, shuffleList} from "./functions"
import { PlayerState } from "../gameStateHost/PlayerState";
import { PlayerStateClient } from "../gameStateClient/PlayerStateClient";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { MainMenu } from "../menu/MainMenu";
import { ChatMessageStateClient } from "../gameStateClient/ChatMessageStateClient";
import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import { getRandomRole } from "./ROLES";
import { PhaseStateMachine } from "./PHASE";

//Hi sammy it's Bea I think you're very cool :)

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

    COLOR : {
        IMPORTANT : "#cbcb00",  //#fae457
        GAME_TO_YOU : "#007800",
        GAME_TO_ALL : "#005000",
        CHAT : "#000078",
        MY_CHAT : "#0000a0",
    },

    pubNub : new PubNubWrapper(),
    tick : function(){
        
        this.pubNub.tick();
        if(GameManager.host) GameManager.host.tick();
        if(GameManager.client) GameManager.client.tick()
        setTimeout(()=>{
            GameManager.tick();
        },10)
    },
    host : {
        isHost : false,
        roomCode : "",
        players : {},
        gameStarted : false,

        cycleNumber : 1, //game starts with day 1, then goes into night 1, //increments on morning timeout
        cycle : {
            trialsLeftToday : 0, //how many trials are allowed left today
        },
        setCycle(){
            GameManager.host.cycle = {
                trialsLeftToday : 3,
            }
        },
        /**
         * 
         * @param {Function} func - function that takes PlayerState as parameter and returns boolean 
         * @returns {Array} players who run through the function and returned true
         */
        getPlayersWithFilter(func){
            let out = []
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName]
                if(func(player))
                    out.push(player)
            }
            return out;
        },

        startGame : function(){
            GameManager.host.gameStarted = true;

            let informationList = [];
            let playerIndividual = {};

            //informationList.push(new ChatMessageState("NoTitle", "All Player", GameManager.COLOR.GAME_TO_ALL));

            let roleList = [
            //  [faction, alignment, exact]
                [null, null, "Mafioso"],
                [null, null, "Sheriff"],
            ];
            shuffleList(roleList);

            let alreadyPickedRolesList = [];
            let index = 0;
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.setUpAvailableButtons(GameManager.host.players);

                let roleName = "";
                if(!roleList[index]){
                    roleName = getRandomRole("Random", "Random", alreadyPickedRolesList);
                }else if(roleList[index][2]){
                    roleName = roleList[index][2];
                }else{
                    roleName = getRandomRole(
                        roleList[index][0] ? roleList[index][0] : "Random",
                        roleList[index][1] ? roleList[index][1] : "Random",
                        alreadyPickedRolesList
                    );
                }

                alreadyPickedRolesList.push(roleName);
                player.createPlayerRole(roleName);

                playerIndividual[playerName] = {
                    informationList : (()=>{
                        return [new ChatMessageState(player.role.persist.roleName, player.role.getRoleObject().basicDescription, GameManager.COLOR.GAME_TO_YOU)];
                    })(),
                };
                index++;
            }

            GameManager.HOST_TO_CLIENT["START_GAME"].send(
                ((()=>{
                    let out = [];
                    for(let playerName in GameManager.host.players){
                        out.push(playerName);
                    }
                    return out;
                })()),
                playerIndividual,
                informationList,
            );

            PhaseStateMachine.startPhase("Discussion");
        },
        create : function(){
            GameManager.host.isHost = true;
            GameManager.host.roomCode = generateRandomString(4);
            GameManager.pubNub.subscribe(GameManager.host.roomCode);

            GameManager.pubNub.addHostListener((m)=>{
                
                for(const key in GameManager.CLIENT_TO_HOST){        
                    if(GameManager.CLIENT_TO_HOST[key].ID !== m.typeId)
                        continue;
                    GameManager.CLIENT_TO_HOST[key].receive(m.contents);
                }
            });
        },
        sendMessage: function(messageType, contents){
            GameManager.pubNub.createAndPublish(messageType.ID, contents)
        },
        tick : function(){
            PhaseStateMachine.tick();
        }
    },
    client : {
        roomCode : "",
        playerName : "",

        phaseName: "",
        cycleNumber : 1,

        players : {},
        information : [],
        cycle : {
            targetedPlayerNames : [],
            votedForName : "",
        },
        

        clickTarget : function(name){
            GameManager.CLIENT_TO_HOST["BUTTON_TARGET"].send(GameManager.client.playerName, name);
        },
        clickClearTarget : function(){
            GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_TARGETS"].send(GameManager.client.playerName);
        },
        clickVote : function(name){

        },
        clickWhisper : function(name){

        },
        create: function(_roomCode, _playerName){
            GameManager.client.roomCode = _roomCode;
            GameManager.client.playerName = _playerName;
            GameManager.pubNub.subscribe(_roomCode);

            GameManager.pubNub.addClientListener((m)=>{
                for(const key in GameManager.HOST_TO_CLIENT){
                    if(GameManager.HOST_TO_CLIENT[key].ID !== m.typeId)
                        continue;
                    GameManager.HOST_TO_CLIENT[key].receive(m.contents);
                }
            });

            GameManager.CLIENT_TO_HOST["ASK_JOIN"].send(_playerName);
        },
        sendMessage: function(messageType, contents){
            GameManager.pubNub.createAndPublish(messageType.ID, contents)
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
                    let alreadyJoined = false;
                    for(let playerName in GameManager.host.players){
                        if(playerName === contents.playerName)
                            alreadyJoined = true;
                            break;
                    }
                    if(!alreadyJoined)GameManager.host.players[contents.playerName] = (new PlayerState(contents.playerName));
                    GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, true);
                }
                GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, false);
                
            }
        ),
        "BUTTON_TARGET":new MessageType(false,
            /**
             * 
             * @param {String} playerName
             * @param {String} targetingName
             */
            (playerName, targetingName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_TARGET"], {
                playerName: playerName,
                targetingName: targetingName
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Night") return;

                let player = GameManager.host.players[contents.playerName];
                let targetedPlayer = GameManager.host.players[contents.targetingName];

                player.addTarget(
                    targetedPlayer
                );

                let canTargetList = [];
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    if(player.role.getRoleObject().canTargetFunction(player, otherPlayer)) canTargetList.push(otherPlayerName);
                }
                GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].send(contents.playerName, contents.targetingName, player.role.cycle.targeting.map((p)=>p.name), canTargetList);
            }
        ),
        "BUTTON_CLEAR_TARGETS":new MessageType(false,
            (playerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_TARGETS"], {
                playerName: playerName
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Night") return;
                
                let player = GameManager.host.players[contents.playerName];
                if(!player.isTargetingSomeone()) return false;
                player.clearTarget();

                let canTargetList = [];
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    if(player.role.getRoleObject().canTargetFunction(player, otherPlayer)) canTargetList.push(otherPlayerName);
                }

                GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].send(contents.playerName, canTargetList)
            }
        ),
        "BUTTON_VOTE":new MessageType(false, 
            (playerName, playerVotedName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_VOTE"], {
                playerName: playerName,
                playerVotedName: playerVotedName
            })},
            (contents)=>{
                if(contents.playerName === contents.playerVotedName) return;
                if(PhaseStateMachine.currentPhase !== "Voting") return;

                let player = GameManager.host.players[contents.playerName];
                //let playerVoted = GameManager.host.players[contents.playerVotedName];
                
                player.role.cycle.voting = contents.playerVotedName;

                GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].send(contents.playerName, contents.playerVotedName);
            },
        ),
        "BUTTON_CLEAR_VOTE":new MessageType(false,
            (playerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_VOTE"], {
                playerName : playerName,
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Voting") return;
                let player = GameManager.host.players[contents.playerName];
                player.role.cycle.voting = "";
                // GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].send(contents.playerName);
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
                if(GameManager.host.isHost) return;
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
                for(let i = 0; i < contents.allPlayerNames.length; i++){
                    GameManager.client.players[contents.allPlayerNames[i]] = new PlayerStateClient(contents.allPlayerNames[i]);
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
             *  availableButtons : Object - 
             *      {
             *          "Name":{target:false, whisper:true, vote: true}
             *      }
             * @param {Array[ChatMessageState]} informationList 
             */
            (phaseName, cycleNumber, playerIndividual, informationList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_PHASE"], {
                phaseName : phaseName,
                cycleNumber : cycleNumber,
                playerIndividual : playerIndividual,
                informationList : informationList,
            })},
            (contents)=>{
                GameManager.client.targetingList = [];
                GameManager.client.votingList = [];
                GameManager.client.judgement = 0;
                GameManager.client.phaseName = contents.phaseName;
                GameManager.client.cycleNumber = contents.cycleNumber;

                if(contents.informationList){
                    for(let i = 0; i < contents.informationList.length; i++){
                        GameManager.client.information.push(new ChatMessageStateClient(contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color));
                    }
                }

                if(contents.playerIndividual){
                    //individual
                    let player = contents.playerIndividual[GameManager.client.playerName];
                    if(player!==undefined&&player!==null){
                        for(let i = 0; i < player.informationList.length; i++){
                            GameManager.client.information.push(new ChatMessageStateClient(player.informationList[i].title, player.informationList[i].text, player.informationList[i].color));
                        }
                        for(let otherPlayerName in player.availableButtons){
                            GameManager.client.players[otherPlayerName].availableButtons = player.availableButtons[otherPlayerName];
                        }
                    }
                }
            }
        ),
        "BUTTON_TARGET_RESPONSE":new MessageType(true,
            /**
             * 
             * @param {Object} playerIndividual - {
             *  playerTargeted : String
             *  availableTargetButtons : Array[String] - names of players who you can target
             * }
             * 
             */
            (playerName, playerTargetedName, targetedList, canTargetList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"], {
                playerName : playerName,
                playerTargetedName : playerTargetedName,
                targetedList : targetedList,
                canTargetList : canTargetList
            })},
            (contents)=>{
                if(contents.playerName !== GameManager.client.playerName)
                    return;

                for(let playerName in GameManager.client.players){
                    let player = GameManager.client.players[playerName];
                    player.availableButtons.target = contents.canTargetList.includes(playerName);
                }

                GameManager.client.information.push(new ChatMessageStateClient("Target", "You targeted "+contents.playerTargetedName, GameManager.COLOR.GAME_TO_YOU));
                GameManager.client.cycle.targetedPlayerNames = contents.targetedList;
            }
        ),
        "BUTTON_CLEAR_TARGETS_RESPONSE":new MessageType(true,
            /**
             * 
             * @param {Object} playerIndividual - {
             *  playerTargeted : String
             *  availableTargetButtons : Array[String] - names of players who you can target
             * }
             * 
             */
            (playerName, canTargetList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"], {
                playerName : playerName,
                canTargetList : canTargetList
            })},
            (contents)=>{
                if(contents.playerName !== GameManager.client.playerName)
                    return;

                for(let playerName in GameManager.client.players){
                    let player = GameManager.client.players[playerName];
                    player.availableButtons.target = contents.canTargetList.includes(playerName);
                }
                
                GameManager.client.information.push(new ChatMessageStateClient("Clear Targets", "Your targets have been reset", GameManager.COLOR.GAME_TO_YOU));
                GameManager.client.cycle.targetedPlayerNames = [];
            }
        ),
        "BUTTON_VOTE_RESPONSE":new MessageType(false,
            (playerName, playerVotedName)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"], {
                playerName : playerName,
                playerVotedName : playerVotedName
            })},
            (contents)=>{
                //create message saying someone was voted for in chat

                GameManager.client.information.push(new ChatMessageStateClient("Vote", contents.playerName+" voted for "+contents.playerVotedName, GameManager.COLOR.GAME_TO_YOU));

                if(contents.playerName !== GameManager.client.playerName)
                    return;

                
                GameManager.client.cycle.votedForName = contents.playerVotedName;
            }
        ),
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
