import { GameManager } from "./GameManager"

export const AllPhases = {
    Day: {
        phaseTime : 5,
        timeOut: ()=>{
            GameManager.instance.startPhase("Vote");
            GameManager.instance.invokeStateUpdate();
        }
    },
    Vote: {
        phaseTime : 5,
        timeOut: ()=>{
            GameManager.instance.startPhase("Night");
        }
    },
    Testimony: {
        phaseTime : 5,
        timeOut: ()=>{
            GameManager.instance.startPhase("Judgement");
        }
    },
    Judgement: {
        phaseTime : 5,
        timeOut: ()=>{

        }
    },
    Night: {
        phaseTime : 5,
        timeOut: ()=>{

            //save current gamestate so nobody can change who theyre targeting while this code is running
            //remember alot of this code is asynchronous

            //set before
            for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
                let player = GameManager.instance.completeState.gameState.players[i];

                //remind player who they targeted this night
                let s = "You tried to target: ";
                for(let t = 0; t < player.role.targeting.length; t++){
                    let targeted = player.role.targeting[t];
                    s += targeted + ", ";
                }
                s = s.substring(0,s.length-2);
                if(s.length === 19) s+= " nobody";
                player.addGiveInformation(s, false);
            }

            //main night loop
            for(let priority = -12; priority <= 12; priority++){
                
                //loops through priorities
                for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
                    //loops through players
                    let player = GameManager.instance.completeState.gameState.players[i];

                    //set targetedBy
                    if(priority===0){
                        for(let t = 0; t < player.role.targeting.length; t++){
                            let targeted = player.role.targeting[t];
                            GameManager.instance.getPlayerFromName(targeted).role.targetedBy.push(player.name);
                        }
                    }

                    player.doMyRole(priority);
                }
            }

            let listMessages = [];

            //reset after
            for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
                //loops through players
                let player = GameManager.instance.completeState.gameState.players[i];
                
                for(let j = 0; j < player.giveInformation.length; j++){
                    listMessages.push(GameManager.instance.createSendChatMessage(player.giveInformation[j].information, player.name + " Information", player.giveInformation[j].isPublic ? "public information" : "private information"));
                }
                player.cycleReset();
            }

            GameManager.instance.sendBulkChatMessage(listMessages);
            GameManager.instance.startPhase("Mourning");
            //GameManager.instance.invokeStateUpdate();
        },
    },
    Mourning: {
        phaseTime : 5,
        timeOut: ()=>{
            GameManager.instance.completeState.gameState.dayNumber++;
            GameManager.instance.startPhase("Day");
            GameManager.instance.invokeStateUpdate();
        }
    }
}