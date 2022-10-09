import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import GameManager from "./GameManager";
import { ROLES } from "./ROLES";

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
        currentPhase = phaseName;
        PHASES[currentPhase].onStart();
    },
    tick : ()=>{
        if(currentPhase)
            PhaseStateMachine.timeLeft--;

        if(PhaseStateMachine.timeLeft===0){
            PHASES[currentPhase].onTimeOut();
        }
    }
}
const PHASES = {
    "Night":new Phase(10, 
        ()=>{
            //give players target buttons
            for(let i = 0; i < GameManager.host.players.length; i++){

            }
        }, 
        ()=>{
            //set loop first
            //main loop 
            for(let priority = -12; priority < 12; priority++){
                //this loops through priorities

                for(let playerIndex = 0; playerIndex < GameManager.host.players.length; playerIndex++){
                    //loops through each player 
                    let player = GameManager.host.players[playerIndex];
                    
                    //set targetedBy
                    if(priority===0){
                        for(let t = 0; t < player.role.targeting.length; t++){
                            //let targeted = player.role.cycle.targeting[t];
                            //INCOMEPLETE INCOMPLETE INCOMPLETE
                        }
                    }
                    
                    player.role.doMyRole(priority);
                }
            }
            //reset loop after
            for(let i = 0; i < GameManager.host.players.length; i++){
                let player = GameManager.host.players[i];

                player.role.setCycle();
            }

            PhaseStateMachine.startPhase("Morning");
        }
    ),
    "Morning":new Phase(10,
        ()=>{
            playerIndividualMessage = {};
            informationListMessage = [];
            informationListMessage.push(new ChatMessageState("Morning", "Do not speak"));
            GameManager.HOST_TO_CLIENT["START_PHASE"].send(
                phaseName, playerIndividualMessage, informationListMessage
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
