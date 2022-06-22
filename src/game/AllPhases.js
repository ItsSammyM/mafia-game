import { GameManager } from "./GameManager"
import { MyRole } from "./MyRole";

export const AllPhases = {
    Day: {
        phaseTime : 5,
    },
    Vote: {
        phaseTime : 5,
    },
    Testimony: {
        phaseTime : 5,
    },
    Judgement: {
        phaseTime : 5,
    },
    Night: {
        phaseTime : 10,
        timeOut: ()=>{

            //save current gamestate so nobody can change who theyre targeting while this code is running
            //remember alot of this code is asynchronous

            for(let priority = -10; priority < 10; priority++){
                //loops through priorities
                for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
                    //loops through players
                    let player = GameManager.instance.completeState.gameState.players[i];
                    MyRole.doMyRole(priority, player);
                }
            }

            for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
                //loops through players
                let player = GameManager.instance.completeState.gameState.players[i];
                ////Reset role here
            }

            GameManager.instance.invokeStateUpdate();
        },
    },
    Mourning: {
        phaseTime : 5,
    }
}