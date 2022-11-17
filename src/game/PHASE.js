import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import GameManager from "./GameManager";
import { shuffleList } from "./functions";

class Phase{
    constructor(_maxTimeSeconds, _onStart, _onTimeOut){
        this.maxTimeSeconds = _maxTimeSeconds;
        this.onStart = _onStart;
        this.onTimeOut = _onTimeOut;
    }
}
export let PhaseStateMachine = {
    currentPhase : null,
    phaseStartTime : 0,
    startPhase : (phaseName)=>{
        PhaseStateMachine.phaseStartTime = Date.now();

        PhaseStateMachine.currentPhase = phaseName;
        PHASES[PhaseStateMachine.currentPhase].onStart();
    },
    getTimeLeft(){
        if(!PHASES[PhaseStateMachine.currentPhase]) return null;
        if(!PhaseStateMachine.phaseStartTime) return null;
        return PHASES[PhaseStateMachine.currentPhase].maxTimeSeconds*1000 - (Date.now() - PhaseStateMachine.phaseStartTime);
    },
    tick : ()=>{
        if(!PhaseStateMachine.currentPhase) return;
        
        let timePassed = Date.now() - PhaseStateMachine.phaseStartTime;
        
        if(timePassed > PHASES[PhaseStateMachine.currentPhase].maxTimeSeconds*1000){
            PHASES[PhaseStateMachine.currentPhase].onTimeOut();
        }
    }
}
let standardStartPhase = function(){
    for(let playerName in GameManager.host.players){
        let player = GameManager.host.players[playerName];

        player.resetCycleVariables(PhaseStateMachine.currentPhase);
        GameManager.HOST_TO_CLIENT["AVAILABLE_BUTTONS"].send(playerName);
    }
    GameManager.HOST_TO_CLIENT["SEND_UNSENT_MESSAGES"].send();
    GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
    GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].send();
    GameManager.HOST_TO_CLIENT["START_PHASE"].send();
    GameManager.HOST_TO_CLIENT["TIME_LEFT"].send();
}
export const PHASES = {
    "Night":new Phase(1, 
        ()=>{
            GameManager.host.cycle.playerOnTrial = null;
            
            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState("Night "+GameManager.host.cycleNumber, null, GameManager.COLOR.GAME_TO_ALL));

            //give players target buttons
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                //can target loop
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    // player.availableButtons[otherPlayer.name] = {target:false,whisper:false,vote:false};
                    player.availableButtons[otherPlayerName].target = player.getRoleObject().canTargetFunction(player, otherPlayer);
                    player.availableButtons[otherPlayerName].vote = false;
                    player.availableButtons[otherPlayerName].whisper = false;
                }
                player.addChatMessages(informationListMessage);

                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(player.role.getRoleObject().team && player.role.persist.alive)
                    player.chatGroupSendList.push(player.role.getRoleObject().team);
                if(!player.role.persist.alive)
                    player.chatGroupSendList.push("Dead");
            }
            
            GameManager.host.swapMafioso();
            standardStartPhase();
        }, 
        ()=>{
            //main loop 
            for(let priority = -12; priority <= 12; priority++){
                for(let playerName in GameManager.host.players){

                    let player = GameManager.host.players[playerName];

                    //set visitedBy and visiting
                    if(priority===0){
                        for(let t = 0; t < player.cycleVariables.targeting.value.length; t++){
                            let targetedPlayer = player.cycleVariables.targeting[t].value;

                            let isAstral = false;
                            let astralVisitsList = player.getRoleObject().astralVisitsList;
                            if(astralVisitsList && astralVisitsList.length >= t)
                                isAstral = player.getRoleObject().astralVisitsList[t];

                            if(isAstral) continue;
                            if(player.cycleVariables.roleblockedTonight.value && player.getRoleObject().roleblockable) continue;

                            targetedPlayer.cycleVariables.targetedBy.value.push(player);
                        }
                    }
                    
                    player.doMyRole(priority);
                }
            }

            PhaseStateMachine.startPhase("Morning");
        }
    ),
    "Morning":new Phase(1,
        ()=>{
            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState("Morning "+GameManager.host.cycleNumber, null, GameManager.COLOR.GAME_TO_ALL));
            
            //main loop
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }
                
                player.addChatMessages(informationListMessage);
                shuffleList(player.cycleVariables.nightInformation.value);
                player.addChatMessages(player.cycleVariables.nightInformation.value.map((l)=>{return l[0]}));

                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(!player.alive)
                    player.chatGroupSendList.push("Dead");
            }


            //ADD dead messages
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(!player.cycleVariables.attackTonight.value || player.alive) continue;
                player.showDied();
            }

            standardStartPhase();
        },
        ()=>{
            GameManager.host.setCycle();
            GameManager.host.cycleNumber++;

            PhaseStateMachine.startPhase("Discussion");
        }
    ),
    "Discussion":new Phase(1,
        ()=>{
            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState("Discussion "+GameManager.host.cycleNumber, null, GameManager.COLOR.GAME_TO_ALL));

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }
                
                player.addChatMessages(informationListMessage);
                
                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(player.alive && !player.cycleVariables.extra.value.blackmailed)
                    player.chatGroupSendList.push("All");
                if(!player.alive)
                    player.chatGroupSendList.push("Dead");
            }

            
            standardStartPhase();
        },
        ()=>{
            if(GameManager.host.cycle.trialsLeftToday > 0){
                PhaseStateMachine.startPhase("Voting");
            }else{
                PhaseStateMachine.startPhase("Night");
            }            
        }
    ),
    "Voting":new Phase(1,
        ()=>{
            GameManager.host.cycle.numVotesNeeded = Math.floor(GameManager.host.getPlayersWithFilter((p)=>{return p.role.persist.alive}).length / 2) + 1;
            GameManager.host.cycle.playerOnTrial = null;

            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState(
                "Voting "+GameManager.host.cycleNumber,
                "You need at least "+GameManager.host.cycle.numVotesNeeded+" votes to trial someone.",
                GameManager.COLOR.GAME_TO_ALL
            ));

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.canVote(otherPlayer);
                }

                player.addChatMessages(informationListMessage);

                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(player.role.persist.alive && !player.role.cycle.extra.blackmailed)
                    player.chatGroupSendList.push("All");
                if(!player.role.persist.alive)
                    player.chatGroupSendList.push("Dead");
            }

            standardStartPhase();
        },
        ()=>{
            //if somebody is voted then voting wouldnt have timed out
            PhaseStateMachine.startPhase("Night");
        } 
    ),
    "Testimony":new Phase(1,
        ()=>{
            
            GameManager.host.cycle.trialsLeftToday--;

            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState(
                "Testimony "+GameManager.host.cycleNumber,
                GameManager.host.cycle.playerOnTrial.name+" is on trial.", 
                GameManager.COLOR.GAME_TO_ALL
            ));

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }

                player.addChatMessages(informationListMessage);

                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(!player.role.persist.alive)
                    player.chatGroupSendList.push("Dead");
            }

            GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].send(GameManager.host.cycle.playerOnTrial.name);
            standardStartPhase();

        },
        ()=>{
            PhaseStateMachine.startPhase("Judgement");
        }
    ),
    "Judgement":new Phase(1, 
        ()=>{
            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState(
                "Judgement "+GameManager.host.cycleNumber,
                GameManager.host.cycle.playerOnTrial.name+" is on trial.", 
                GameManager.COLOR.GAME_TO_ALL
            ));

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }

                player.addChatMessages(informationListMessage);


                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(player.alive && !player.cycleVariables.extra.value.blackmailed)
                    player.chatGroupSendList.push("All");
                if(!player.alive)
                    player.chatGroupSendList.push("Dead");
            }

            standardStartPhase();
        },
        ()=>{
            let whoVotedMessages = [];
            let totalJudgement = 0;

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                if(!player.alive) continue;
                if(player === GameManager.host.cycle.playerOnTrial) continue;

                totalJudgement += player.role.cycle.judgement;

                let out = "";
                if(player.cycleVariables.judgement.value<0){
                    out+=" voted guilty";
                }else if(player.cycleVariables.judgement.value>0){
                    out+=" voted innocent";
                }else{
                    out+=" abstained";
                }

                whoVotedMessages.push(new ChatMessageState(
                    null,
                    player.name+out, 
                    GameManager.COLOR.GAME_TO_ALL
                ));
            }
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.addChatMessages(whoVotedMessages);
            }

            if(totalJudgement < 0){
                //guilty
                PhaseStateMachine.startPhase("Final Words");
            }else if(GameManager.host.cycle.trialsLeftToday > 0){
                //innocent && more trials
                PhaseStateMachine.startPhase("Voting");
            }else{
                //innocent and no more trials
                for(let playerName in GameManager.host.players){
                    let player = GameManager.host.players[playerName];
                    player.addMessage(new ChatMessageState(null, "No trials left today", GameManager.COLOR.GAME_TO_ALL));
                }
                PhaseStateMachine.startPhase("Night");
            }
            GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].send();
        }
    ),
    "Final Words":new Phase(1,
        ()=>{
            let informationListMessage = [];

            informationListMessage.push(new ChatMessageState(
                "Final Words " + GameManager.host.cycleNumber,
                null, 
                GameManager.COLOR.GAME_TO_ALL
            ));

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }

                player.addChatMessages(informationListMessage);

                //WHAT CHAT SHOULDS PEOPLE SEND IN?
                player.chatGroupSendList = [];
                if(player.alive && !player.cycleVariables.extra.value.blackmailed)
                    player.chatGroupSendList.push("All");
                if(!player.alive)
                    player.chatGroupSendList.push("Dead");
            }

            standardStartPhase();
        },
        ()=>{
            
            if(GameManager.host.cycle.playerOnTrial){
                GameManager.host.cycle.playerOnTrial.die();
                GameManager.host.cycle.playerOnTrial.showDied();
                GameManager.host.cycle.playerOnTrial.chatGroupSendList.push("Dead");
            }   
            
            
            PhaseStateMachine.startPhase("Night");
        }
    )
}
