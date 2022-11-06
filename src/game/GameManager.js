import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString, shuffleList, mergeSort} from "./functions"
import { PlayerState } from "../gameStateHost/PlayerState";
import { PlayerStateClient } from "../gameStateClient/PlayerStateClient";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { MainMenu } from "../menu/MainMenu";
import { ChatMessageStateClient } from "../gameStateClient/ChatMessageStateClient";
import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import { getRandomRole, TEAMS, Role } from "./ROLES";
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
                if(this.receiveListeners[i])
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
        GAME_TO_YOU : "#007800",    //light green
        GAME_TO_ALL : "#005000",    //dark green
        CHAT : "#00a0c8",   //dark blue
        MY_CHAT : "#00a0c0",    //light blue
    },
    MAX_NAME_LENGTH : 20,
    MAX_MESSAGE_LENGTH : 300,

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

        chatGroups : {
            "Dead":[],//list of all dead players
            "All":[]//list of all players
        },

        cycleNumber : 1, //game starts with day 1, then goes into night 1, //increments on morning timeout
        cycle : {
            trialsLeftToday : 0, //how many trials are allowed left today
            numVotesNeeded : 9999,
            playerOnTrial : null,
        },
        setCycle(){ //called on start of morning
            GameManager.host.cycle = {
                trialsLeftToday : 3,
                numVotesNeeded : Math.floor(GameManager.host.getPlayersWithFilter((p)=>{return p.role.persist.alive}).length / 2) + 1,
                playerOnTrial : null,
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
                    out.push(player);
            }
            return out;
        },
        getAllPlayerNames(){
            let allOtherPlayers = [];
            for(let otherPlayerName in GameManager.host.players){
                allOtherPlayers.push(otherPlayerName);
            }
            return allOtherPlayers;
        },

        someoneVoted(){

            let playerVoted = null;
            //reset votedBy
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.role.cycle.votedBy = [];
            }
            //set votedBy
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(player.role.cycle.voting){
                    player.role.cycle.voting.role.cycle.votedBy.push(player);
                }

                
            }
            //check if someone voted
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(GameManager.host.cycle.numVotesNeeded <= player.role.cycle.votedBy.length){
                    playerVoted = player;
                    break;
                }
            }
            return playerVoted;
        },

        startGame : function(){
            GameManager.host.gameStarted = true;

            let informationList = [];
            let playerIndividual = {};

            //informationList.push(new ChatMessageState("NoTitle", "All Player", GameManager.COLOR.GAME_TO_ALL));

            //GIVE ROLES
            let roleList = [
            //  [faction, alignment, exact]
                ["Mafia", "Killing", null],
                ["Town", "Protective", null],
                ["Town", "Investigative", null],
            ];
            shuffleList(roleList);

            let alreadyPickedRolesList = [];
            let index = 0;
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.setUpAvailableButtons(GameManager.host.players);

                //give random role
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
                //add to already picked role list
                alreadyPickedRolesList.push(roleName);
                player.createPlayerRole(roleName); //actually create role

                //tell players whats going on
                playerIndividual[playerName] = {
                    roleName : player.role.persist.roleName,
                };
                player.addMessage(
                    new ChatMessageState(
                        player.role.getRoleObject().faction+" "+player.role.getRoleObject().alignment+", "+player.role.persist.roleName, 
                        player.role.getRoleObject().basicDescription, 
                        GameManager.COLOR.GAME_TO_YOU
                    )
                );
                player.addMessages(informationList);
                index++;
            }


            //CHAT GROUPS
            for(let teamName in TEAMS){
                GameManager.host.chatGroups[teamName] = [];
            }

            //after roleList is picked, create extra chat groups
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                //WHISPER
                GameManager.host.chatGroups[playerName] = [player]; //also add blackmailer
                //ALL
                GameManager.host.chatGroups["All"].push(player);
                //TEAMS
                if(player.role.getRoleObject().team)
                    GameManager.host.chatGroups[player.role.getRoleObject().team].push(player);
            }



            //SUFFIXES
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                player.addSuffix(player.name, player.role.persist.roleName);    //suffix yourself

                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];
    
                    if(Role.onSameTeam(player, otherPlayer) && TEAMS[player.role.getRoleObject().team].showFactionMembers)
                        player.addSuffix(otherPlayer.name, otherPlayer.role.persist.roleName);  //suffix for same team members
                }
            }




            GameManager.HOST_TO_CLIENT["START_GAME"].send(
                ((()=>{
                    let out = [];
                    for(let playerName in GameManager.host.players){
                        out.push(playerName);
                    }
                    return out;
                })()),  //all player names
                playerIndividual,   //peoples own rolenames
                mergeSort(roleList, (a,b)=>{

                    if(a[0] !== b[0]){
                        if(a[0] === null)  return -1000;
                        if(b[0] === null)  return 1000;

                        if(a[0] === "Mafia")  return 1000;
                        if(b[0] === "Mafia")  return -1000;

                        if(a[0] === "Coven")  return 1000;
                        if(b[0] === "Coven")  return -1000;

                        if(a[0] === "Town")  return 1000;
                        if(b[0] === "Town")  return -1000;

                        if(a[0] === "Neutral")  return -1000;
                        if(b[0] === "Neutral")  return 1000;
                    }

                    if(a[1]!== b[1]){
                        if(a[1] === null)  return -500;
                        if(b[1] === null)  return 500;

                        if(a[1] === "Chaos")  return 500;
                        if(b[1] === "Chaos")  return -500;

                        if(a[1] === "Investigative")  return 500;
                        if(b[1] === "Investigative")  return -500;

                        if(a[1] === "Killing")  return 500;
                        if(b[1] === "Killing")  return -500;

                        if(a[1] === "Protective")  return 500;
                        if(b[1] === "Protective")  return -500;

                        if(a[1] === "Support")  return 500;
                        if(b[1] === "Support")  return -500;

                        if(a[1] === "Deception")  return 500;
                        if(b[1] === "Deception")  return -500;
                    }
                }), //give sorted rolelist as to give no clue to how it was randomly organized
            );
            GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
            GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
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

        roleName: "",
        playerName : "",

        chatGroupSendList : ["All"],
        seeSelfAlive : true,

        phaseName: "",
        cycleNumber : 1,

        roleList : [],
        players : {},
        information : [],
        chatMessageList : [],
        addMessage(m, invokeListeners=true){
            GameManager.client.chatMessageList.push(m);

            if(!invokeListeners) return;
            for(let i in GameManager.client.messageUpdateListeners){
                GameManager.client.messageUpdateListeners[i].listener();
            }
        },
        addMessages(m){
            for(let i in m){
                GameManager.client.addMessage(m[i], false);
            }
            for(let i in GameManager.client.messageUpdateListeners){
                GameManager.client.messageUpdateListeners[i].listener();
            }
        },
        messageUpdateListeners : [],
        addMessageListener(l){
            GameManager.client.messageUpdateListeners.push(l);
        },
        removeMessageListener(l){
            for(let i = 0; i < GameManager.client.messageUpdateListeners.length; i++){
                if(GameManager.client.messageUpdateListeners[i] === l){
                    GameManager.client.messageUpdateListeners.splice(i);
                    return;
                }
            }
        },

        cycle : {
            targetedPlayerNames : [],
            votedForName : null,
            judgementStatus : 0,
            playerOnTrialName : null,
        },
        setPhase(){GameManager.client.cycle = {
            targetedPlayerNames : [],
            votedForName : null,
            judgementStatus : 0,
        }},
        

        timeLastButtonClickedms : 0,
        numOfPressesInTimeFrame : 0,

        spamPreventer : function(){
            this.numOfPressesInTimeFrame++;
            if(Date.now() - this.timeLastButtonClickedms < 500 && this.numOfPressesInTimeFrame > 2) return true;
            GameManager.client.timeLastButtonClickedms = Date.now();
            this.numOfPressesInTimeFrame=0;
            return false;
        },
        clickTarget : function(name){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_TARGET"].send(GameManager.client.playerName, name);
        },
        clickClearTarget : function(){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_TARGETS"].send(GameManager.client.playerName);
        },
        clickVote : function(name){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_VOTE"].send(GameManager.client.playerName, name);
        },
        clickClearVote : function(){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_VOTE"].send(GameManager.client.playerName);
        },
        clickJudgement : function(judgement){
            if(this.spamPreventer()) return;

            //1 is innocent
            //-1 is guilty
            //0 is abstain
            GameManager.CLIENT_TO_HOST["BUTTON_JUDGEMENT"].send(GameManager.client.playerName, judgement);
        },
        clickSendMessage : function(message){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["SEND_MESSAGE"].send(
                GameManager.client.playerName, GameManager.client.chatGroupSendList, 
                new ChatMessageStateClient(
                    GameManager.client.playerName,
                    message,
                    GameManager.COLOR.CHAT
                ));
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
                
                contents.playerName = contents.playerName.substring(0, GameManager.MAX_NAME_LENGTH).trim();
                if(contents.playerName===""||!contents.playerName) return;

                let alreadyJoined = false;
                for(let playerName in GameManager.host.players){
                    if(playerName === contents.playerName)
                        alreadyJoined = true;
                        break;
                }

                if(!GameManager.host.gameStarted){
                    if(!alreadyJoined)GameManager.host.players[contents.playerName] = (new PlayerState(contents.playerName));
                    GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, true);
                }else{

                    // LATE JOINING IMPLEment LAteR
                    // if(alreadyJoined){
                    //     GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, true, true);
                    // }else{
                    //     GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, false);
                    // }
                     
                }

                
                
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
                
                player.addMessage(new ChatMessageStateClient("Target", "You targeted "+targetedPlayer.name, GameManager.COLOR.GAME_TO_YOU));
                
                //GameManager.client.addMessage(new ChatMessageStateClient("Target", "You targeted "+contents.playerTargetedName, GameManager.COLOR.GAME_TO_YOU));
                GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].send(contents.playerName, player.role.cycle.targeting.map((p)=>p.name), canTargetList);
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
            }
        ),
        "BUTTON_CLEAR_TARGETS":new MessageType(false,
            (playerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_TARGETS"], {
                playerName: playerName
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Night") return;
                
                let player = GameManager.host.players[contents.playerName];
                if(!player.role.cycle.targeting.length>0) return;
                player.clearTarget();

                let canTargetList = [];
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    if(player.role.getRoleObject().canTargetFunction(player, otherPlayer)) canTargetList.push(otherPlayerName);
                }
                player.addMessage(new ChatMessageStateClient("Clear Targets", "Your targets have been reset", GameManager.COLOR.GAME_TO_YOU));

                GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].send(contents.playerName, canTargetList);
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
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
                let playerVoted = GameManager.host.players[contents.playerVotedName];
                
                if(player.role.cycle.voting === playerVoted) return;

                if(player.role.persist.alive && playerVoted.role.persist.alive && player !== playerVoted){
                    player.role.cycle.voting = playerVoted;
                }

                let canVoteList = [];
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName]
                    otherPlayer.addMessage(new ChatMessageStateClient("Vote", contents.playerName+" voted for "+contents.playerVotedName, GameManager.COLOR.CHAT));
                    if(player.canVote(otherPlayer))
                        canVoteList.push(otherPlayerName);
                }

                GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].send(contents.playerName, contents.playerVotedName, canVoteList);
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
                
                let playerOnTrial = GameManager.host.someoneVoted();

                if(playerOnTrial !== null){
                    GameManager.host.cycle.playerOnTrial = playerOnTrial;
                    GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].send(GameManager.host.cycle.playerOnTrial.name);
                    PhaseStateMachine.startPhase("Testimony");
                }
            },
        ),
        "BUTTON_CLEAR_VOTE":new MessageType(false,
            (playerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_CLEAR_VOTE"], {
                playerName : playerName,
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Voting") return;
                let player = GameManager.host.players[contents.playerName];

                if(player.role.cycle.voting == null || !player.role.persist.alive) return;

                let playerVotingName = player.role.cycle.voting.name;
                player.role.cycle.voting = null;
                

                let canVoteList = [];
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];
                    otherPlayer.addMessage(new ChatMessageStateClient("Clear Votes", contents.playerName+" stopped voting for "+playerVotingName, GameManager.COLOR.CHAT));
                    if(player.canVote(otherPlayer))
                        canVoteList.push(otherPlayerName);
                }

                GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].send(contents.playerName, canVoteList);
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
                                
            }
        ),
        "BUTTON_JUDGEMENT":new MessageType(false,
            (playerName, judgement)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_JUDGEMENT"], {
                playerName : playerName,
                judgement : judgement,
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase !== "Judgement") return;
                let player = GameManager.host.players[contents.playerName];

                if(!player.role.persist.alive) return;
                GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].send(contents.playerName, contents.judgement);
                player.role.cycle.judgement = contents.judgement;
            }
        ),
        "SEND_MESSAGE":new MessageType(false,
            (playerName, chatGroups, chatMessage)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["SEND_MESSAGE"], {
                playerName:playerName,
                chatGroups:chatGroups,
                chatMessage:chatMessage,
            })},
            (contents)=>{
                contents.chatMessage.text = contents.chatMessage.text.substring(0,GameManager.MAX_MESSAGE_LENGTH).trim();
                if(contents.chatMessage.text===""||!contents.chatMessage.text) return;

                let playersWhoGotMessageAlready = [];

                for(let chatGroup in GameManager.host.chatGroups){
                    let playerList = GameManager.host.chatGroups[chatGroup];

                    if(!contents.chatGroups.includes(chatGroup)) continue;
                    if(!GameManager.host.players[contents.playerName].chatGroupSendList.includes(chatGroup)) continue;

                    for(let playerName in GameManager.host.players){
                        let player = GameManager.host.players[playerName];

                        if(playersWhoGotMessageAlready.includes(player)) continue;
                        if( !playerList.includes(player) && player!==GameManager.host.players[contents.playerName]   ) continue;

                        player.addMessage(new ChatMessageState(contents.chatMessage.title, contents.chatMessage.text, contents.chatMessage.color));
                        playersWhoGotMessageAlready.push(player);
                    }
                }
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
            }
        ),
    },
    HOST_TO_CLIENT:{
        "ASK_JOIN_RESPONSE":new MessageType(true, 
            (playerName, success, sendToMain=false)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"], {
                playerName: playerName,
                success: success,
                sendToMain : sendToMain,
            })},
            (contents)=>{
                if(GameManager.host.isHost) return;
                if(contents.success){

                    if(contents.sendToMain){
                        Main.instance.changeMenu(<MainMenu/>);
                    }else{
                        Main.instance.changeMenu(<WaitJoinMenu/>);
                    }
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
            (allPlayerNames, playerIndividual, roleList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_GAME"], {
                playerIndividual  : playerIndividual,
                allPlayerNames: allPlayerNames,
                roleList: roleList,
            })},
            (contents)=>{
                GameManager.client.roleList = contents.roleList;
                for(let i = 0; i < contents.allPlayerNames.length; i++){
                    GameManager.client.players[contents.allPlayerNames[i]] = new PlayerStateClient(contents.allPlayerNames[i]);
                }

                // for(let i = 0; i < contents.informationList.length; i++){
                //     GameManager.client.addMessage(new ChatMessageStateClient(
                //         contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color
                //     ));
                // }
                //individual
                let player = contents.playerIndividual[GameManager.client.playerName];
                if(player){
                    // for(let i = 0; i < player.informationList.length; i++){
                    //     GameManager.client.addMessage(new ChatMessageStateClient(
                    //         player.informationList[i].title, player.informationList[i].text, player.informationList[i].color
                    //     ));
                    // }
                    GameManager.client.roleName = player.roleName;
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
            (phaseName, cycleNumber, playerIndividual)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_PHASE"], {
                phaseName : phaseName,
                cycleNumber : cycleNumber,
                playerIndividual : playerIndividual,
            })},
            (contents)=>{
                GameManager.client.phaseName = contents.phaseName;
                GameManager.client.cycleNumber = contents.cycleNumber;
                GameManager.client.setPhase();

                // if(contents.informationList){
                //     for(let i = 0; i < contents.informationList.length; i++){
                //         GameManager.client.addMessage(new ChatMessageStateClient(
                //             contents.informationList[i].title, contents.informationList[i].text, contents.informationList[i].color
                //         ));
                //     }
                // }

                if(contents.playerIndividual){
                    //individual
                    let player = contents.playerIndividual[GameManager.client.playerName];
                    if(player){
                        // for(let i = 0; i < player.informationList.length; i++){
                        //     GameManager.client.addMessage(new ChatMessageStateClient(
                        //         player.informationList[i].title, player.informationList[i].text, player.informationList[i].color
                        //     ));
                        // }
                        for(let otherPlayerName in player.availableButtons){
                            GameManager.client.players[otherPlayerName].availableButtons = player.availableButtons[otherPlayerName];
                        }
                    }
                }
            }
        ),
        "PLAYER_ON_TRIAL":new MessageType(true,
            (playerOnTrialName)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"], {
                playerOnTrialName : playerOnTrialName,
            })},
            (contents)=>{
                GameManager.client.cycle.playerOnTrialName = contents.playerOnTrialName;
            }
        ),
        "UPDATE_PLAYERS":new MessageType(true,
            ()=>{
                /*
                {
                    myPlayer:{  //my CLient
                        otherPlayerName:{   
                            suffixes : ["Dead",  "Mayor", "5 Votes"],
                            alive : false
                        },
                        otherPlayerName2:{ //what i see jimmy guy as
                            suffixes : ["Dead",  "Mayor", "5 Votes"],
                            alive : false
                        },
                    },
                    myPlayer2:{ //jimmys client
                        otherPlayerName:{ //what jimmy sees me as
                            suffixes : ["Dead",  "Mayor", "5 Votes"],
                            alive : false
                        },
                        otherPlayerName2:{  
                            suffixes : ["Dead",  "Mayor", "5 Votes"],
                            alive : false
                        },
                    }
                }
                */
                let playersObject = {};
                for(let playerName in GameManager.host.players){
                    let player = GameManager.host.players[playerName];
                    

                    playersObject[playerName] = {};

                    for(let otherPlayerName in GameManager.host.players){
                        let otherPlayer = GameManager.host.players[otherPlayerName];

                        playersObject[playerName][otherPlayerName] = {
                            suffixes : player.suffixes[otherPlayerName],
                            alive : otherPlayer.role.persist.alive
                        }
                    }
                }

                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"], {
                    players: playersObject,
                });
            },
            (contents)=>{

                for(let otherPlayerName in contents.players[GameManager.client.playerName]){
                    let otherPlayerMsg = contents.players[GameManager.client.playerName][otherPlayerName];

                    let otherPlayer = GameManager.client.players[otherPlayerName];

                    if(!otherPlayer) continue;

                    otherPlayer.suffixes = otherPlayerMsg.suffixes;
                    otherPlayer.alive = otherPlayerMsg.alive;
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
            (playerName, targetedList, canTargetList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"], {
                playerName : playerName,
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
                
                //GameManager.client.addMessage(new ChatMessageStateClient("Clear Targets", "Your targets have been reset", GameManager.COLOR.GAME_TO_YOU));
                GameManager.client.cycle.targetedPlayerNames = [];
            }
        ),
        "BUTTON_VOTE_RESPONSE":new MessageType(true,
            (playerName, playerVotedName, canVoteList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"], {
                playerName : playerName,
                playerVotedName : playerVotedName,
                canVoteList : canVoteList,
            })},
            (contents)=>{
                //create message saying someone was voted for in chat

                //GameManager.client.addMessage(new ChatMessageStateClient("Vote", contents.playerName+" voted for "+contents.playerVotedName, GameManager.COLOR.CHAT));

                if(contents.playerName !== GameManager.client.playerName)
                    return;

                for(let playerName in GameManager.client.players){
                    let player = GameManager.client.players[playerName];
                    player.availableButtons.vote = contents.canVoteList.includes(playerName);
                }
                
                GameManager.client.cycle.votedForName = contents.playerVotedName;
            }
        ),
        "BUTTON_CLEAR_VOTE_RESPONSE":new MessageType(true,
            (playerName, canVoteList)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"], {
                playerName : playerName,
                canVoteList : canVoteList,
            })},
            (contents)=>{
                //create message saying someone was voted for in chat

                //GameManager.client.addMessage(new ChatMessageStateClient("Clear Votes", contents.playerName+" stopped voting for "+contents.currentPlayerVotedName, GameManager.COLOR.CHAT));

                if(contents.playerName !== GameManager.client.playerName)
                    return;
                
                for(let playerName in GameManager.client.players){
                    let player = GameManager.client.players[playerName];
                    player.availableButtons.vote = contents.canVoteList.includes(playerName);
                }

                GameManager.client.cycle.votedForName = null;
            }
        ),
        "BUTTON_JUDGEMENT_RESPONSE":new MessageType(true,
            (playerName, judgement)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"], {
                playerName : playerName,
                judgement : judgement,
            })},
            (contents)=>{
                if(contents.playerName !== GameManager.client.playerName) return;
                GameManager.client.cycle.judgementStatus = contents.judgement;
            }
        ),
        "SEND_UNSENT_MESSAGES":new MessageType(true,
            ()=>{
                
                let playerIndividual = {};
                for(let playerName in GameManager.host.players){
                    playerIndividual[playerName] = GameManager.host.players[playerName].getUnsentMessages();
                }
                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"], {
                /**
                 * playerIndividual : {
                 *  Name : [ChatMessage, ChatMessage]
                 *  OtherName : [ChatMessage, ChatMessage]
                 * }
                 */
                playerIndividual : playerIndividual,
            })},
            (contents)=>{
                if(!contents.playerIndividual[GameManager.client.playerName]) return;

                GameManager.client.addMessages(contents.playerIndividual[GameManager.client.playerName].map((p)=>{
                    // try{
                    //     eval(p.text);
                    // }catch{}
                    return new ChatMessageStateClient(p.title, p.text, p.color)
                }));
            }
        ),
        "UPDATE_CLIENT":new MessageType(true,
            /**
             * playerIndividual : {
             *      Sammy : {
             *          seeSelfDead : true
             *          chatGroupSendList : ["All", "Mafia", "Dead", "Medium"]
             *      }
             * }
             */
            ()=>{
            
                let playerIndividual = {};

                for(let playerName in GameManager.host.players){
                    let player = GameManager.host.players[playerName];

                    playerIndividual[playerName] = {
                        seeSelfAlive : player.role.persist.alive,
                        chatGroupSendList : player.chatGroupSendList,
                    };
                }

                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"], {
                    playerIndividual : playerIndividual,
                });
            },
            (contents)=>{
                GameManager.client.chatGroupSendList = contents.playerIndividual[GameManager.client.playerName].chatGroupSendList;
                GameManager.client.seeSelfAlive = contents.playerIndividual[GameManager.client.playerName].seeSelfAlive;
            }
        ),
    },
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
