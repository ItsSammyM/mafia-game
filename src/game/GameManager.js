import { PubNubWrapper } from "./PubNubWrapper"
import { generateRandomString, shuffledList, mergeSort} from "./functions"
import { PlayerState } from "../gameStateHost/PlayerState";
import { PlayerStateClient } from "../gameStateClient/PlayerStateClient";
import { Main } from "../Main"
import { WaitJoinMenu } from "../menu/WaitJoinMenu";
import { MainMenu } from "../menu/MainMenu";
import { ChatMessageStateClient } from "../gameStateClient/ChatMessageStateClient";
import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import { getRandomRole, TEAMS, Role, ROLES } from "./ROLES";
import { PhaseStateMachine, PHASES } from "./PHASE";
import { StartMenu } from "../menu/StartMenu";
import { CycleVariable } from "./CycleVariable";
import { GraveStateClient } from "../gameStateClient/GraveStateClient";
/*
weird stuff

"create-react-app": "^5.0.1",
*/
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
        GREYED_OUT: "#555555",

        IMPORTANT: "#FFFF77",
        IMPORTANT_RED: "#EE0000",

        DISCUSSION_CHAT: "#9daafa",
        DEAD_CHAT: "#0c1a75",
        TEAM_CHAT: "#752f71",

        WHISPER_CHAT: "#ff00fb",
        NIGHT_SPECIAL_CHAT: "#4f0694",   //medium seance
        
        VOTE_CHAT: "#ffa159",

        PHASE_CHANGE_CHAT: "#036e21",
        NIGHT_INFORMATION_CHAT: "#36f76d",
    },
    MAX_NAME_LENGTH : 20,
    MAX_MESSAGE_LENGTH : 300,

    pubNub : new PubNubWrapper(),
    tick : function(){
        
        this.pubNub.tick();
        if(GameManager.host) GameManager.host.tick();
        if(GameManager.client) GameManager.client.tick();
        
        setTimeout(()=>{
            GameManager.tick();
        },20)
    },
    host : {
        lastSentTime: 0,

        isHost : false,
        roomCode : "",
        players : {},
        gameStarted : false,

        roleList : null,
        phaseTimes : null,
        investigativeResults : null,

        graves : {},

        chatGroups : {
            "Dead" : [],//list of all dead players
            "All" : []//list of all players
        },

        cycleNumber : 1, //game starts with day 1, then goes into night 1, //increments on morning timeout
        cycleVariables : {
            trialsLeftToday : new CycleVariable('Morning', 3), //how many trials are allowed left today
            numVotesNeeded : new CycleVariable('Voting', ()=>Math.floor(GameManager.host.getPlayersWithFilter((p)=>p.alive).length / 2) + 1),  //more than half
            playerOnTrial : new CycleVariable('Morning', null),
        },
        /**
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

                player.cycleVariables.votedBy.value = [];
            }
            //set votedBy
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(player.cycleVariables.voting.value){
                    if(player.getRoleObject().name === "Mayor" && player.roleExtra.revealed){
                        player.cycleVariables.voting.value.cycleVariables.votedBy.value.push(player);
                        player.cycleVariables.voting.value.cycleVariables.votedBy.value.push(player);
                    }
                    player.cycleVariables.voting.value.cycleVariables.votedBy.value.push(player);
                }
            }
            //check if someone voted
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(GameManager.host.cycleVariables.numVotesNeeded.value <= player.cycleVariables.votedBy.value.length){
                    playerVoted = player;
                    break;
                }
            }
            return playerVoted;
        },

        startGame : function(_roleList, _phaseTimes, _investigativeResults){
            GameManager.host.gameStarted = true;
            GameManager.host.phaseTimes = _phaseTimes;
            GameManager.host.roleList = _roleList;
            GameManager.host.investigativeResults = _investigativeResults;

            //remove Investigative results if theyre impossible to exist
            for(let i = 0; i < GameManager.host.investigativeResults.length; i++){
                for(let j = 0; j < GameManager.host.investigativeResults[i].length; j++){

                    let roleName = GameManager.host.investigativeResults[i][j];

                    if(roleName === "Jester") continue;   //never remove jesters

                    if(!GameManager.host.rolePossibleToExist(roleName)){
                        GameManager.host.investigativeResults[i].splice(j, 1);
                        j--;
                    }
                }
            }

            let informationList = [];
            let playerIndividual = {};

            //SET PHASE TIMES
            for(let phaseName in PHASES){
                PHASES[phaseName].maxTimeSeconds = _phaseTimes[phaseName];
            }

            //GIVE ROLES
            let roleList = _roleList;
            //sort rolelist
            GameManager.host.roleList = mergeSort(roleList, (a,b)=>{

                if(a[2]) return 10000;
                if(b[2]) return -10000;

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
            });

            let shuffledPlayerNameList = shuffledList(Object.keys(GameManager.host.players));
            let alreadyPickedRolesList = [];
            let index = 0;
            for(let i in shuffledPlayerNameList){
                let player = GameManager.host.players[shuffledPlayerNameList[i]];

                player.setUpAvailableButtons(GameManager.host.players);

                //give random role
                let roleName = "";
                if(!roleList[index]){   //if entire thing is null, get random role
                    roleName = getRandomRole("Random", "Random", alreadyPickedRolesList);
                }else if(roleList[index][2]){   //if exact exists then just give it to them
                    roleName = roleList[index][2];
                }else{  //otherwise, get random role using rolelist
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
                playerIndividual[player.name] = {
                    roleName : player.roleName,
                };
                player.addChatMessages(informationList);
                index++;
            }
            

            //CHAT GROUPS
            for(let teamName in TEAMS){
                GameManager.host.chatGroups[teamName] = [];
            }

            //find all blackmailers
            let blackmailers = GameManager.host.getPlayersWithFilter((p)=>p.getRoleObject().name==="Blackmailer");
            //after roleList is picked, create extra chat groups -and exe targets
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                //WHISPER
                GameManager.host.chatGroups[playerName] = [];
                GameManager.host.chatGroups[playerName].push(player)
                GameManager.host.chatGroups[playerName] = GameManager.host.chatGroups[playerName].concat(blackmailers); //also add blackmailers
                //ALL
                GameManager.host.chatGroups["All"].push(player);
                //TEAMS
                if(player.getRoleObject().team)
                    GameManager.host.chatGroups[player.getRoleObject().team].push(player);


                //also while were here give exe their target
                if(player.getRoleObject().name === "Executioner"){
                    player.roleExtra.executionerTarget = ((player)=>{
                        //get random townie who isnt mayor or jailor cuz that would just be straight up unfair
                        
                        //get list of all townies
                        let allTownies = [];
                        for(let townieName in GameManager.host.players){
                            let townie = GameManager.host.players[townieName];
            
                            if(townie.getRoleObject().faction === "Town" && (
                                townie.getRoleObject().name !== "Mayor" && townie.getRoleObject().name !== "Veteran"
                                ))
                                allTownies.push(townie);
                        }

                        if(allTownies.length === 0){
                            player.addChatMessage(new ChatMessageState(
                                null,
                                "You have no target so you will become a Jester.",
                                GameManager.COLOR.IMPORTANT
                            ));
                            return null;
                        }
                        let exeTarget = shuffledList(allTownies)[0];

                        player.addChatMessage(new ChatMessageState(
                            null,
                            "Your target is "+exeTarget.name,
                            GameManager.COLOR.IMPORTANT
                        ));
                        return exeTarget;
                    })(player);
                }
            }


            //SUFFIXES
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                player.addSuffix(player.name, player.roleName);    //suffix yourself

                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];
    
                    if(Role.onSameTeam(player, otherPlayer) && TEAMS[player.getRoleObject().team].showFactionMembers)
                        player.addSuffix(otherPlayer.name, otherPlayer.roleName);  //suffix for same team members
                }
            }

            //Send game state and stuff.
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                player.resetCycleVariables(true);
                GameManager.HOST_TO_CLIENT["YOUR_ROLE"].send(player.name, player.roleName);
            }
            GameManager.HOST_TO_CLIENT["ROLE_LIST_AND_PLAYERS"].send();

            GameManager.HOST_TO_CLIENT["INVESTIGATIVE_RESULTS"].send();
            GameManager.HOST_TO_CLIENT["START_GAME"].send();
            GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
            GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
            PhaseStateMachine.startPhase("Final Words");


            GameManager.host.checkEndGame();
        },
        create : function(){
            GameManager.host.isHost = true;
            GameManager.host.roomCode = generateRandomString(4);
            GameManager.pubNub.subscribe(GameManager.host.roomCode);

            GameManager.pubNub.setHostListener((m)=>{
                
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
        },
        checkEndGame : function(){
            let livingRoleNamesList = [];
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                if(!player.alive) continue;

                livingRoleNamesList.push(player.roleName);
            }

            //If only 1 victoryGroup Remains
            let victoryGroupsRemaining = [];
            for(let i in livingRoleNamesList){
                let roleName = livingRoleNamesList[i];
                if(
                    ROLES[roleName].victoryGroup!==null && 
                    !victoryGroupsRemaining.includes(ROLES[roleName].victoryGroup)
                )
                    victoryGroupsRemaining.push(ROLES[roleName].victoryGroup);
            }

            if(victoryGroupsRemaining.length <= 1){
                GameManager.host.endGame();
                return true;
            }
            return false;
        },
        endGame(){
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                player.addChatMessage(new ChatMessageState("Game Over", "Win conditions not implemented yet", GameManager.COLOR.IMPORTANT_RED));
            }
            GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
        },
        swapMafioso(){
            //find if mafioso
            let gameHasMafiosoOrGodfather = false;

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(player.alive && (player.roleName === "Mafioso" || player.roleName === "Godfather")){
                    gameHasMafiosoOrGodfather = true;
                    break;
                }
            }
            if(gameHasMafiosoOrGodfather) return;

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                if(player.alive && player.getRoleObject().faction === "Mafia"){
                    GameManager.host.changePlayerRole(player, "Mafioso");
                    break;
                }
            }
        },
        changePlayerRole(player, newRoleName){

            for(let i = 0; i < player.suffixes[player.name].length; i++){
                if (player.suffixes[player.name][i] === player.roleName){
                    player.suffixes[player.name][i] = newRoleName;
                }
            }

            player.createPlayerRole(newRoleName);
            GameManager.HOST_TO_CLIENT["YOUR_ROLE"].send(player.name, player.roleName);
        },
        rolePossibleToExist(roleName){
            let roleObject = ROLES[roleName];

            if(!roleObject) return false;
            if(roleObject.maximumCount < 1) return false;

            for(let i = 0; i < GameManager.host.roleList.length; i++){
                let faction = GameManager.host.roleList[i][0];
                let alignment = GameManager.host.roleList[i][1];
                let exactRole = GameManager.host.roleList[i][2];
                
                if(exactRole === roleName) return true;
                if(exactRole === null && (faction===roleObject.faction || faction===null) && (alignment===roleObject.alignment || alignment===null))
                    return true;
            }
            return false;
            
        },

        kickPlayer(playerName){
            delete GameManager.host.players[playerName];
            GameManager.HOST_TO_CLIENT["KICK"].send(playerName);
            GameManager.HOST_TO_CLIENT["PLAYER_NAME_LIST"].send();
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
        investigativeResults : [],
        players : {},
        information : [],
        chatMessageList : [],

        maxTimeMs : 0,
        starTimeMs : 0,
        timeLeftMs : 0,

        /*
            savedNotePad:{
                Will: "Sus",
                Note : "Latio"
            }

        */
        savedNotePad : {},

        graves : {},

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

        tickListeners : [],
        addTickListener(l){
            GameManager.client.tickListeners.push(l);
        },
        removeTickListener(l){
            for(let i = 0; i < GameManager.client.tickListeners.length; i++){
                if(GameManager.client.tickListeners[i] === l){
                    GameManager.client.tickListeners.splice(i);
                    return;
                }
            }
        },
        invokeTickListeners(){
            for(let i in GameManager.client.tickListeners){
                GameManager.client.tickListeners[i].listener();
            }
        },


        cycle : {
            targetedPlayerNames : [],
            votedForName : null,
            judgementStatus : 0,
            playerOnTrialName : null,
        },
        setPhase(){
            GameManager.client.cycle.targetedPlayerNames = [];
            GameManager.client.cycle.votedForName = null;
            GameManager.client.cycle.judgementStatus = 0;
        },
        

        timeLastButtonClickedms : 0,
        numOfPressesInTimeFrame : 0,

        timeLastChatMesagems: 0,

        spamPreventer : function(){
            this.numOfPressesInTimeFrame++;
            if(Date.now() - this.timeLastButtonClickedms < 2000 && this.numOfPressesInTimeFrame > 2) return true;
            GameManager.client.timeLastButtonClickedms = Date.now();
            this.numOfPressesInTimeFrame=0;
            return false;
        },
        spamMessagePreventer : function(){
            if(Date.now() - GameManager.client.timeLastChatMesagems < 2000) return true;
            GameManager.client.timeLastChatMesagems = Date.now();
            return false;
        },
        clickTarget : function(name){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_TARGET"].send(GameManager.client.playerName, name);
        },
        clickDayTarget : function(name){
            if(this.spamPreventer()) return;

            GameManager.CLIENT_TO_HOST["BUTTON_DAY_TARGET"].send(GameManager.client.playerName, name);
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
            if(this.spamMessagePreventer()) return;
            
            
            GameManager.CLIENT_TO_HOST["SEND_MESSAGE"].send(
                GameManager.client.playerName, GameManager.client.chatGroupSendList, message
                // new ChatMessageStateClient(
                //     GameManager.client.playerName,
                //     message,
                //     (
                //         GameManager.client.chatGroupSendList.includes("All")?GameManager.COLOR.DISCUSSION_CHAT:
                //         GameManager.client.chatGroupSendList.includes("Dead")?GameManager.COLOR.DEAD_CHAT:

                //         GameManager.client.chatGroupSendList.includes("Mafia")?GameManager.COLOR.TEAM_CHAT:
                //         GameManager.client.chatGroupSendList.includes("Vampire")?GameManager.COLOR.TEAM_CHAT:
                //         GameManager.client.chatGroupSendList.includes("Coven")?GameManager.COLOR.TEAM_CHAT:
                //         GameManager.COLOR.WHISPER_CHAT
                //     )
                // )
                );
        },
        clickSaveNotePad : function(notePadName, notePadValue){
            GameManager.client.savedNotePad[notePadName] = notePadValue.trim();
            GameManager.CLIENT_TO_HOST["SEND_NOTEPAD"].send(GameManager.client.playerName, notePadName);
        },
        clickWhisper : function(name){
            GameManager.CLIENT_TO_HOST["BUTTON_WHISPER"].send(GameManager.client.playerName, name);
        },


        create: function(_roomCode, _playerName){
            GameManager.client.roomCode = _roomCode;
            GameManager.client.playerName = _playerName;
            GameManager.pubNub.subscribe(_roomCode);

            GameManager.pubNub.setClientListener((m)=>{
                for(const key in GameManager.HOST_TO_CLIENT){
                    if(GameManager.HOST_TO_CLIENT[key].ID !== m.typeId)
                        continue;
                    GameManager.HOST_TO_CLIENT[key].receive(m.contents);
                }
            });

            GameManager.CLIENT_TO_HOST["ASK_JOIN"].send(_playerName);
        },
        dispose: function(){
            GameManager.pubNub.unsubscribe();
            GameManager.client.roomCode = "";
            GameManager.client.playerName = "";

            GameManager.pubNub.setClientListener((m)=>{});
        },
        sendMessage: function(messageType, contents){
            GameManager.pubNub.createAndPublish(messageType.ID, contents);
        },
        tick : function(){
            GameManager.client.timeLeftMs = Math.max(GameManager.client.maxTimeMs - (Date.now() - GameManager.client.starTimeMs));
            GameManager.client.invokeTickListeners();
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
                    if(playerName === contents.playerName){
                        alreadyJoined = true;
                        break;
                    }
                }

                if(!GameManager.host.gameStarted){
                    if(!alreadyJoined)
                        GameManager.host.players[contents.playerName] = (new PlayerState(contents.playerName));
                    
                    GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, true);
                    setTimeout(()=>{GameManager.HOST_TO_CLIENT["PLAYER_NAME_LIST"].send();}, 1000);
                    
                    
                }else{
                    // LATE JOINING IMPLEment LAteR
                    if(alreadyJoined){
                        let player = GameManager.host.players[contents.playerName];

                        GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(player.name, true, true);
                        GameManager.HOST_TO_CLIENT["ROLE_LIST_AND_PLAYERS"].send();
                        
                        GameManager.HOST_TO_CLIENT["YOUR_ROLE"].send(player.name, player.roleName);
                        GameManager.HOST_TO_CLIENT["AVAILABLE_BUTTONS"].send(player.name);  //This didnt work once. giving people who rejoin vote buttons that didnt work anyway
                        GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
                        GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].send(GameManager.host.cycleVariables.playerOnTrial.value);
                        GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].send();
                        GameManager.HOST_TO_CLIENT["INVESTIGATIVE_RESULTS"].send();

                        //resend messages
                        player.copyChatMessagesToUnsentMessages();
                        GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
                        GameManager.HOST_TO_CLIENT["START_PHASE"].send();
                        GameManager.HOST_TO_CLIENT["TIME_LEFT"].send();
                        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].send(player.name, player.canTargetList());
                        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].send(player.name, player.canVoteList());

                    }else{
                        GameManager.HOST_TO_CLIENT["ASK_JOIN_RESPONSE"].send(contents.playerName, false);
                    }    
                }
            }
        ),
        "BUTTON_WHISPER":new MessageType(false, 
            (playerName, whisperingToPlayerName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_WHISPER"], {
                playerName : playerName,
                whisperingToPlayerName: whisperingToPlayerName,
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase==="Night") return;    //cant click this at night
                GameManager.host.players[contents.playerName].clickWhisper(contents.whisperingToPlayerName);
                GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].send();
            }
        ),
        "BUTTON_DAY_TARGET":new MessageType(false,
            /**
             * 
             * @param {String} playerName
             * @param {String} targetingName
             */
            (playerName, targetingName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["BUTTON_DAY_TARGET"], {
                playerName: playerName,
                targetingName: targetingName
            })},
            (contents)=>{
                if(PhaseStateMachine.currentPhase === "Night") return;

                let player = GameManager.host.players[contents.playerName];
                let targetedPlayer = GameManager.host.players[contents.targetingName];

                player.addChatMessage(new ChatMessageStateClient("Day Target", "You targeted "+targetedPlayer.name, GameManager.COLOR.IMPORTANT));
                player.getRoleObject().doDayTarget(player, targetedPlayer);
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].dayTarget = player.getRoleObject().canDayTargetFunction(player, otherPlayer);
                }

                GameManager.HOST_TO_CLIENT["AVAILABLE_BUTTONS"].send(contents.playerName);
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
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

                player.addChatMessage(new ChatMessageStateClient("Target", "You targeted "+targetedPlayer.name, GameManager.COLOR.NIGHT_INFORMATION_CHAT));
                //also tell teammates
                for(let anyPlayerName in GameManager.host.players){
                    let anyPlayer = GameManager.host.players[anyPlayerName];
                    if (Role.onSameTeam(anyPlayer, player) && anyPlayer!==player){
                        anyPlayer.addChatMessage(new ChatMessageStateClient("Teammate Target", player.name+" targeted "+targetedPlayer.name, GameManager.COLOR.NIGHT_INFORMATION_CHAT));
                    }
                }
                
                //GameManager.client.addMessage(new ChatMessageStateClient("Target", "You targeted "+contents.playerTargetedName, GameManager.COLOR.GAME_TO_YOU));
                GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].send(contents.playerName, player.cycleVariables.targeting.value.map((p)=>p.name), player.canTargetList());
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
                if(!player.cycleVariables.targeting.value.length>0) return;
                player.clearTarget();

                player.addChatMessage(new ChatMessageStateClient("Clear Targets", "Your targets have been reset", GameManager.COLOR.NIGHT_INFORMATION_CHAT));

                //also tell teammates
                for(let anyPlayerName in GameManager.host.players){
                    let anyPlayer = GameManager.host.players[anyPlayerName];
                    if (Role.onSameTeam(anyPlayer, player) && anyPlayer!==player){
                        anyPlayer.addChatMessage(new ChatMessageStateClient("Teammate Clear Targets", player.name+" reset targets", GameManager.COLOR.NIGHT_INFORMATION_CHAT));
                    }
                }

                GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].send(contents.playerName, player.canTargetList());
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
                
                if(player.cycleVariables.voting.value === playerVoted) return;

                if(player.alive && playerVoted.alive && player !== playerVoted){
                    player.cycleVariables.voting.value = playerVoted;
                }

                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName]
                    otherPlayer.addChatMessage(new ChatMessageStateClient("Vote", contents.playerName+" voted for "+contents.playerVotedName, GameManager.COLOR.VOTE_CHAT));
                }

                GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].send(contents.playerName, contents.playerVotedName, player.canVoteList());
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
                
                let playerOnTrial = GameManager.host.someoneVoted();

                GameManager.HOST_TO_CLIENT["VOTED_NUMBER_CHANGE"].send();
                GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();

                if(playerOnTrial){
                    GameManager.host.cycleVariables.playerOnTrial.value = playerOnTrial;
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

                if(player.cycleVariables.voting.value == null || !player.alive) return;

                let playerVotingName = player.cycleVariables.voting.value.name;
                player.cycleVariables.voting.value = null;
                
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];
                    otherPlayer.addChatMessage(new ChatMessageStateClient("Clear Votes", contents.playerName+" stopped voting for "+playerVotingName, GameManager.COLOR.VOTE_CHAT));
                }

                GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].send(contents.playerName, player.canVoteList());
                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();

                GameManager.host.someoneVoted();
                
                GameManager.HOST_TO_CLIENT["VOTED_NUMBER_CHANGE"].send();
                GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
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

                if(!player.alive) return;
                GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].send(contents.playerName, contents.judgement);
                player.cycleVariables.judgement.value = contents.judgement;
            }
        ),
        "SEND_MESSAGE":new MessageType(false,
            (playerName, chatGroups, message)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["SEND_MESSAGE"], {
                playerName:playerName,
                chatGroups:chatGroups,
                message:message,    //just the text they entered
            })},
            (contents)=>{
                //trim message, fix it up
                contents.message = contents.message.substring(0,GameManager.MAX_MESSAGE_LENGTH).trim();
                if(contents.message===""||!contents.message) return;

                
                let playersWhoGotMessageAlready = [];

                for(let chatGroup in GameManager.host.chatGroups){
                    if(!contents.chatGroups.includes(chatGroup)) continue;
                        //if were not sending in this group then ignore
                    if(!GameManager.host.players[contents.playerName].chatGroupSendList.includes(chatGroup) && 
                        !GameManager.host.players[contents.playerName].cycleVariables.isWhispering.value) continue;
                        //if were not alloed to be sending in chatgroup AND were not whispering then continue, therefore
                        //if we are allowed to send in this group or were whispering, then skip

                        //i have no idea what this line means but im not going to delete it because everything works rn.


                    let playerList = GameManager.host.chatGroups[chatGroup];
                        //list of all people we should send to

                    
                    //if this is a whisper chat then also send a message saying a whisper happened
                    //if chatGroup === name of any player, then it is a whisper chat, but dont tell everyone if it night
                    if(PhaseStateMachine.currentPhase !== "Night" && GameManager.host.getAllPlayerNames().includes(chatGroup)){
                        //if its a whisper chat then loop through players and tell them whats happened
                        for(let playerName in GameManager.host.players){
                            let player = GameManager.host.players[playerName];
                            player.addChatMessage(new ChatMessageState(null, "\""+contents.playerName+"\" is whispering to \""+chatGroup+"\"", GameManager.COLOR.IMPORTANT));
                        }
                    }


                    //now set the color of the message BASED on what group its being sent to
                    //#region color
                    let chatGroupNameToColor = {
                        "Vampire" : GameManager.COLOR.TEAM_CHAT,
                        "Mafia" : GameManager.COLOR.TEAM_CHAT,
                        "Coven" : GameManager.COLOR.TEAM_CHAT,

                        "Dead" : GameManager.COLOR.DEAD_CHAT,
                        "All" : GameManager.COLOR.DISCUSSION_CHAT,
                    }
                    let messageColor = GameManager.COLOR.WHISPER_CHAT;
                    for(let chatGroupName in chatGroupNameToColor){
                        if(chatGroup === chatGroupName){
                            messageColor = chatGroupNameToColor[chatGroupName];
                        }
                    }

                    //medium talking to dead, no matter what unless whisper
                    if(chatGroup === "Dead" && GameManager.host.players[contents.playerName].getRoleObject().name === "Medium"){
                        messageColor = GameManager.COLOR.IMPORTANT;
                    }
                    
                    //if we are in a whisper chat then make it whisper color no matter what.
                    //looking back at this it seems it is useless but im keeping it just in case
                    if(!Object.keys(chatGroupNameToColor).includes(chatGroup)){
                        messageColor = GameManager.COLOR.WHISPER_CHAT;
                    }

                    //#endregion

                    


                    //send to yourself, but grey, only if we didnt already
                    if(!playersWhoGotMessageAlready.includes(GameManager.host.players[contents.playerName])){
                        GameManager.host.players[contents.playerName].addChatMessage(new ChatMessageState(contents.playerName, contents.message, GameManager.COLOR.GREYED_OUT));
                        playersWhoGotMessageAlready.push(GameManager.host.players[contents.playerName]);
                    }

                    //send to every player in this group if they didnt already get the message.
                    for(let playerName in GameManager.host.players){
                        let player = GameManager.host.players[playerName];

                        if(playersWhoGotMessageAlready.includes(player)) continue;
                        if( !   (playerList.includes(player) || player===GameManager.host.players[contents.playerName])   ) continue;

                        player.addChatMessage(new ChatMessageState(contents.playerName, contents.message, messageColor));
                        playersWhoGotMessageAlready.push(player);
                    }
                }

                GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
            }
        ),
        "SEND_NOTEPAD":new MessageType(false,
            (playerName, notePadName)=>{GameManager.client.sendMessage(GameManager.CLIENT_TO_HOST["SEND_NOTEPAD"], {
                playerName : playerName, 
                notePadName : notePadName,
                notePadValue : GameManager.client.savedNotePad[notePadName]
            })},
            (contents)=>{
                let player = GameManager.host.players[contents.playerName];
                if(!player) return;
                player.savedNotePad[contents.notePadName] = contents.notePadValue.trim();
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
                if(GameManager.client.playerName!==contents.playerName) return;
                if(GameManager.host.isHost) return;
                if(contents.success){

                    if(contents.sendToMain){
                        Main.instance.changeMenu(<MainMenu/>);
                    }else{
                        Main.instance.changeMenu(<WaitJoinMenu/>);
                    }
                }else{
                    Main.instance.changeMenu(<StartMenu/>);
                    GameManager.client.dispose();
                }
            }
        ),
        "KICK":new MessageType(true, 
            (playerName)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["KICK"], {
                playerName: playerName,
            })},
            (contents)=>{
                if(contents.playerName !== GameManager.client.playerName) return;
                Main.instance.changeMenu(<StartMenu/>);
                GameManager.client.dispose();
            }
        ),
        "ROLE_LIST_AND_PLAYERS":new MessageType(true,
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["ROLE_LIST_AND_PLAYERS"], {
                roleList: GameManager.host.roleList,
                allPlayerNames: ((()=>{
                    let out = [];
                    for(let playerName in GameManager.host.players){
                        out.push(playerName);
                    }
                    return out;
                })()),
            })},
            (contents)=>{
                GameManager.client.roleList = contents.roleList;
                for(let i = 0; i < contents.allPlayerNames.length; i++){
                    //if we already have the player then dont re add them
                    if(!    (contents.allPlayerNames[i] in GameManager.client.players)  )
                        GameManager.client.players[contents.allPlayerNames[i]] = new PlayerStateClient(contents.allPlayerNames[i]);
                }
            }
        ),
        "PLAYER_NAME_LIST":new MessageType(true,
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["PLAYER_NAME_LIST"], {
                allPlayerNames: ((()=>{
                    let out = [];
                    for(let playerName in GameManager.host.players){
                        out.push(playerName);
                    }
                    return out;
                })()),
            })},
            (contents)=>{}
        ),
        "YOUR_ROLE":new MessageType(true,
            (playerName, roleName)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["YOUR_ROLE"], {
                playerName  : playerName,
                roleName : roleName
            })},
            (contents)=>{
                if(GameManager.client.playerName !== contents.playerName) return;
                GameManager.client.roleName = contents.roleName;
            }
        ),
        "INVESTIGATIVE_RESULTS":new MessageType(true,
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["INVESTIGATIVE_RESULTS"], {
                investigativeResults : GameManager.host.investigativeResults,
            });},
            (contents)=>{
                GameManager.client.investigativeResults = contents.investigativeResults;
            }
        ),
        "START_GAME":new MessageType(true, 
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_GAME"], {
            })},
            (contents)=>{
                Main.instance.changeMenu(<MainMenu/>);
            }
        ),
        "AVAILABLE_BUTTONS":new MessageType(true,
            /**
             * 
             * @param {String} playerName
             */
            (playerName)=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["AVAILABLE_BUTTONS"], {
                playerName: playerName,
                availableButtons: GameManager.host.players[playerName].availableButtons,
            })},
            (contents)=>{
                if(GameManager.client.playerName!==contents.playerName) return;

                for(let otherPlayerName in contents.availableButtons){
                    GameManager.client.players[otherPlayerName].availableButtons = contents.availableButtons[otherPlayerName];
                }
            }
        ),
        "START_PHASE":new MessageType(true,
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["START_PHASE"], {
                phaseName : PhaseStateMachine.currentPhase,
                cycleNumber : GameManager.host.cycleNumber,
                backgroundColor: PHASES[PhaseStateMachine.currentPhase].backgroundColor,
            })},
            (contents)=>{
                //if phase actually changed
                if(GameManager.client.phaseName !== contents.phaseName)
                    GameManager.client.setPhase();

                GameManager.client.phaseName = contents.phaseName;
                GameManager.client.cycleNumber = contents.cycleNumber;
                if(MainMenu.instance)
                    MainMenu.instance.setBackgroundColor(contents.backgroundColor);
                if(Main.instance)
                    Main.instance.playSound();
                
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
                            alive : otherPlayer.alive
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

                if(contents.playerName !== GameManager.client.playerName)
                    return;
                
                for(let playerName in GameManager.client.players){
                    let player = GameManager.client.players[playerName];
                    player.availableButtons.vote = contents.canVoteList.includes(playerName);
                }

                GameManager.client.cycle.votedForName = null;
            }
        ),
        "VOTED_NUMBER_CHANGE":new MessageType(true, 
            ()=>{
                let obj = {};
                
                for(let playerName in GameManager.host.players){
                    let player = GameManager.host.players[playerName];
                    obj[playerName] = player.cycleVariables.votedBy.value.length;
                }
                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["VOTED_NUMBER_CHANGE"], {
                    playersToVotedByNum : obj,
                });
            },
            (contents)=>{
                for(let playerName in contents.playersToVotedByNum){
                    GameManager.client.players[playerName].votedByNum = contents.playersToVotedByNum[playerName];
                }
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
                    playerIndividual[playerName] = GameManager.host.players[playerName].getUnsentChatMessages();
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
                        seeSelfAlive : player.alive,
                        chatGroupSendList : player.cycleVariables.isWhispering.value?[player.cycleVariables.isWhispering.value]:player.chatGroupSendList,
                        savedNotePad : player.savedNotePad,
                    };
                }

                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"], {
                    playerIndividual : playerIndividual,
                });
            },
            (contents)=>{
                GameManager.client.chatGroupSendList = contents.playerIndividual[GameManager.client.playerName].chatGroupSendList;
                GameManager.client.seeSelfAlive = contents.playerIndividual[GameManager.client.playerName].seeSelfAlive;
                GameManager.client.savedNotePad = contents.playerIndividual[GameManager.client.playerName].savedNotePad;
            }
        ),
        "SEND_GRAVES":new MessageType(true,
            ()=>{GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["SEND_GRAVES"], {
                graves : GameManager.host.graves,
            });},
            (contents)=>{
                GameManager.client.graves = {};
                for(let playerName in contents.graves){
                    GameManager.client.graves[playerName] = new GraveStateClient(
                        contents.graves[playerName].playerName, 
                        contents.graves[playerName].will, 
                        contents.graves[playerName].roleName, 
                        contents.graves[playerName].phaseDied, 
                        contents.graves[playerName].cycleDied
                    );
                }
            }
        ),
        "TIME_LEFT":new MessageType(true,
            ()=>{
                GameManager.host.sendMessage(GameManager.HOST_TO_CLIENT["TIME_LEFT"], {
                    startTimeMs : PhaseStateMachine.phaseStartTime,
                    maxTimeMs : PHASES[PhaseStateMachine.currentPhase].maxTimeSeconds*1000,
                });
            },
            (contents)=>{
                GameManager.client.starTimeMs = contents.startTimeMs;
                GameManager.client.maxTimeMs = contents.maxTimeMs;
            }   
        ),
    },
};
export default GameManager;
/*{
    channel : msgChannel,
    message : {
        toClient : toClient,
        type: msgType,
        contents: contents
    }
}*/
