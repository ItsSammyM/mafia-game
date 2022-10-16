import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import GameManager from "./GameManager";

class Phase{
    constructor(_maxTime, _onStart, _onTimeOut){
        this.maxTime = _maxTime;
        this.onStart = _onStart;
        this.onTimeOut = _onTimeOut;
    }
}
export let PhaseStateMachine = {
    currentPhase : null,
    timeLeft : 0,
    startPhase : (phaseName)=>{
        PhaseStateMachine.currentPhase = phaseName;
        PhaseStateMachine.timeLeft = PHASES[PhaseStateMachine.currentPhase].maxTime;
        PHASES[PhaseStateMachine.currentPhase].onStart();
    },
    tick : ()=>{
        if(!PhaseStateMachine.currentPhase) return;
        
        PhaseStateMachine.timeLeft--;
        
        if(PhaseStateMachine.timeLeft===0){
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
                for(let p = 0; p < GameManager.host.players.length; p++){
                    let otherPlayer = GameManager.host.players[p];
                    playerIndividualMessage[player.name].availableButtons[otherPlayer.name] = [];

                    if(player.role.getRoleObject().canTargetFunction(player, otherPlayer))
                        playerIndividualMessage[player.name].availableButtons[otherPlayer.name].push("Target");
                }
            }
            informationListMessage.push(new ChatMessageState("Night", "Do not speak, Target someone to use your ability on them."));


            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Night", playerIndividualMessage, informationListMessage
            );
        }, 
        ()=>{
            //set loop first
            //main loop 
            for(let priority = -12; priority < 12; priority++){
                //this loops through priorities

                for(let playerName in GameManager.host.players){
                    //loops through each player 
                    let player = GameManager.host.players[playerName];
                    
                    //set targetedBy
                    if(priority===0){
                        for(let t = 0; t < player.role.cycle.targeting.length; t++){
                            //let targeted = player.role.cycle.targeting[t];
                            //INCOMEPLETE INCOMPLETE INCOMPLETE
                        }
                    }
                    
                    player.role.doMyRole(priority);
                }
            }
            //reset loop after
            for(let playerName in GameManager.host.players){
                let player = GameManager.host.players[playerName];

                player.role.setCycle();
            }

            PhaseStateMachine.startPhase("Morning");
        }
    ),
    "Morning":new Phase(10,
        ()=>{
            let playerIndividualMessage = {};
            let informationListMessage = [];
            
            informationListMessage.push(new ChatMessageState("Morning", "Do not speak"));
            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                "Morning", playerIndividualMessage, informationListMessage
            );
        },
        ()=>{
            
        }
    ),
    "Discussion":new Phase(10),
    "Voting":new Phase(10),
    "Testimony":new Phase(10),
    "Judgement":new Phase(10),
}
