import { GameManager } from "./GameManager"

export const AllPhases = {
    Day: {
        phaseTime : 5,
        onStart: ()=>{
            GameManager.instance.getChatFromTitle("Day").unrestrictAll();
        },
        timeOut: ()=>{
            GameManager.instance.startPhase("Vote");
            GameManager.instance.invokeStateUpdate();
        }
    },
    Vote: {
        phaseTime : 5,
        onStart: ()=>{

        },
        timeOut: ()=>{
            GameManager.instance.startPhase("Night");
        }
    },
    Testimony: {
        phaseTime : 5,
        onStart: ()=>{
            GameManager.instance.getChatFromTitle("Day").restrictAll();
        },
        timeOut: ()=>{
            GameManager.instance.startPhase("Judgement");
        }
    },
    Judgement: {
        phaseTime : 5,
        onStart: ()=>{
            GameManager.instance.getChatFromTitle("Day").unrestrictAll();
        },
        timeOut: ()=>{

        }
    },
    Night: {
        phaseTime : 5,
        onStart: ()=>{
            GameManager.instance.getChatFromTitle("Day").restrictAll();
            GameManager.instance.getChatFromTitle("Mafia").unrestrictAll();
            for(let i = 0; i < GameManager.instance.completeState.gameState.chats.length; i++){
                let chat = GameManager.instance.completeState.gameState.chats[i];
                if(chat.title.includes("Whispers")){
                    chat.restrictAll();
                }
            }
        },
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
                player.role.aliveTonight = player.role.alive;
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
                    listMessages.push(GameManager.instance.createSendChatMessage(
                        player.giveInformation[j].information,
                        player.name + " Information",
                        player.giveInformation[j].isPublic ? "public information" : "private information",
                        "game"
                    ));
                }
                for(let j = 0; j < GameManager.instance.completeState.gameState.giveInformation.length; j++){
                    listMessages.push(GameManager.instance.createSendChatMessage(
                        GameManager.instance.completeState.gameState.giveInformation[j].information, 
                        player.name + " Information", 
                        GameManager.instance.completeState.gameState.giveInformation[j].isPublic ? "public information" : "private information",
                        "game"
                    ));
                }
                player.cycleReset();
            }
            GameManager.instance.completeState.gameState.cycleReset();
            GameManager.instance.sendBulkChatMessage(listMessages);
            GameManager.instance.startPhase("Mourning");
            //GameManager.instance.invokeStateUpdate();
        },
    },
    Mourning: {
        phaseTime : 5,
        onStart: ()=>{
            GameManager.instance.getChatFromTitle("Mafia").restrictAll();

            for(let i = 0; i < GameManager.instance.completeState.gameState.chats.length; i++){
                let chat = GameManager.instance.completeState.gameState.chats[i];
                if(chat.title.includes("Whispers")){
                    chat.unrestrictAll();
                }
            }
        },
        timeOut: ()=>{
            GameManager.instance.completeState.gameState.dayNumber++;
            GameManager.instance.startPhase("Day");
            GameManager.instance.invokeStateUpdate();
        }
    }
}