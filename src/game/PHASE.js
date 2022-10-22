import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import GameManager from "./GameManager";

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
        PhaseStateMachine.phaseStartTime = (new Date()).getTime();

        PhaseStateMachine.currentPhase = phaseName;
        PHASES[PhaseStateMachine.currentPhase].onStart();
    },
    tick : ()=>{
        if(!PhaseStateMachine.currentPhase) return;
        
        let timePassed = (new Date()).getTime() - PhaseStateMachine.phaseStartTime;
        
        if(timePassed > PHASES[PhaseStateMachine.currentPhase].maxTimeSeconds*1000){
            PHASES[PhaseStateMachine.currentPhase].onTimeOut();
        }
    }
}
const PHASES = {
    "Night":new Phase(10, 
        ()=>{
            let playerIndividualMessage = {};
            let informationListMessage = [];
            
            //give players target buttons
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                playerIndividualMessage[playerName] = {
                    informationList : [],
                    availableButtons : {}
                }

                //can target loop
                for(let otherPlayerName in GameManager.host.players){
                    let otherPlayer = GameManager.host.players[otherPlayerName];

                    // player.availableButtons[otherPlayer.name] = {target:false,whisper:false,vote:false};
                    player.availableButtons[otherPlayerName].target = player.role.getRoleObject().canTargetFunction(player, otherPlayer);
                    player.availableButtons[otherPlayerName].vote = false;
                    player.availableButtons[otherPlayerName].whisper = false;

                    //console.log(player.availableButtons[otherPlayerName].target)
                    //console.log(!player.role.getRoleObject().canTargetFunction.(player, otherPlayer))
                }
                playerIndividualMessage[playerName].availableButtons = player.availableButtons;
                
            }
            informationListMessage.push(new ChatMessageState("Night "+GameManager.host.cycleNumber, "Do not speak, Target someone to use your ability on them.", GameManager.COLOR.GAME_TO_ALL));
            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Night", GameManager.host.cycleNumber, playerIndividualMessage, informationListMessage
            );
        }, 
        ()=>{
            //set loop first
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.role.cycle.aliveNow = player.role.persist.alive;
            }

            //main loop 
            for(let priority = -12; priority < 12; priority++){
                //this loops through priorities

                for(let playerName in GameManager.host.players){
                    //loops through each player 
                    let player = GameManager.host.players[playerName];
                    
                    //set targetedBy
                    if(priority===0){
                        for(let t = 0; t < player.role.cycle.targeting.length; t++){
                            let targeted = player.role.cycle.targeting[t];

                            targeted.role.cycle.targetedBy.push(player)
                            //INCOMEPLETE INCOMPLETE INCOMPLETE
                        }
                    }
                    
                    player.doMyRole(priority);
                }
            }
            //reset loop after
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
            }

            PhaseStateMachine.startPhase("Morning");
        }
    ),
    "Morning":new Phase(10,
        ()=>{
            let playerIndividualMessage = {};
            let informationListMessage = [];
            
            
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                playerIndividualMessage[playerName] = {
                    informationList : [],
                    availableButtons : {}
                }

                for(let i in player.role.cycle.nightInformation){
                    playerIndividualMessage[playerName].informationList.push(player.role.cycle.nightInformation[i]);
                }

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }
                
                playerIndividualMessage[playerName].availableButtons = player.availableButtons;
            }
            
            informationListMessage.push(new ChatMessageState("Morning "+GameManager.host.cycleNumber, "Do not speak, collect information.", GameManager.COLOR.GAME_TO_ALL));

            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Morning", GameManager.host.cycleNumber, playerIndividualMessage, informationListMessage
            );

        },
        ()=>{
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];
                player.role.setCycle();
            }
            GameManager.host.setCycle();
            GameManager.host.cycleNumber++;

            PhaseStateMachine.startPhase("Discussion");
        }
    ),
    "Discussion":new Phase(10,
        ()=>{
            let playerIndividualMessage = {};
            let informationListMessage = [];

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                playerIndividualMessage[playerName] = {
                    informationList : [],
                    availableButtons : {}
                }

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    player.availableButtons[otherPlayerName].vote = false;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }
                
                playerIndividualMessage[playerName].availableButtons = player.availableButtons;
            }

            informationListMessage.push(new ChatMessageState("Discussion "+GameManager.host.cycleNumber, "Talk about what you know and convince people to do what you want.", GameManager.COLOR.GAME_TO_ALL));

            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Discussion", GameManager.host.cycleNumber, playerIndividualMessage, informationListMessage
            );
        },
        ()=>{
            if(GameManager.host.cycle.trialsLeftToday > 0){
                PhaseStateMachine.startPhase("Voting");
            }else{
                PhaseStateMachine.startPhase("Night");
            }            
        }
    ),
    "Voting":new Phase(10,
        ()=>{

            let numVotesNeeded = Math.floor(GameManager.host.getPlayersWithFilter((p)=>{return p.alive}).length / 2) + 1;

            let playerIndividualMessage = {};
            let informationListMessage = [];

            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                playerIndividualMessage[playerName] = {
                    informationList : [],
                    availableButtons : {}
                }

                for(let otherPlayerName in GameManager.host.players){
                    //let otherPlayer = GameManager.host.players[otherPlayerName];

                    player.availableButtons[otherPlayerName].target = false;
                    if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].vote = true;
                    //if(playerName !== otherPlayerName) player.availableButtons[otherPlayerName].whisper = true;
                }
                
                playerIndividualMessage[playerName].availableButtons = player.availableButtons;
            }

            informationListMessage.push(new ChatMessageState("Voting "+GameManager.host.cycleNumber, "Vote for a player to put them on trail. You need at least "+numVotesNeeded+" votes to trial someone.", GameManager.COLOR.GAME_TO_ALL));

            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Voting", GameManager.host.cycleNumber, playerIndividualMessage, informationListMessage
            );
        },
        ()=>{
            //if nobody is voted
            PhaseStateMachine.startPhase("Night");
        } 
    ),
    "Testimony":new Phase(10),
    "Judgement":new Phase(10),
}
