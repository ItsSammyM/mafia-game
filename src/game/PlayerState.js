import { AllRoles } from "./AllRoles";
import { GameManager } from "./GameManager";
import { GraveState } from "./GraveState";

export class PlayerState{
    constructor(name)
    {
        this.name = name;
        this.alibi = "No Alibi";
        this.role = null;

        this.grave = null;

        this.giveInformation = [];
        
        //information
        //private or public
    }
    addGiveInformation(information, isPublic=false){
        this.giveInformation.push({
            information : information,
            isPublic : isPublic
        });
    }
    addGiveInformationList(list){
        for(let i = 0; i < list.length; i++){
            this.giveInformation.push(list[i]);
        }
    }
    cycleReset(){
        this.role.cycleReset();
        this.giveInformation = [];
    }

    getMyRole(){
        return AllRoles[this.role.roleTitle];
    }

    doMyRole(priority){
        if(this.role===null || priority === null || this.role.roleblocked) return;
        this.getMyRole().doRole(priority, this);
    }
    roleBlock(){
        if(this.getMyRole().roleblockable){
            if(!this.role.roleblocked){
                this.role.roleblocked = true;
                this.addGiveInformation("You were roleblocked! Your ability might not have worked.", false);
            }
        }else{
            this.addGiveInformation("Someone tried to roleblock you but you are immune", false);
        }
        
    }
    nightKill(attacker, attackPower=1, killMessage="You've been murdered! You may speak with the other dead."){
        /*
        no defense = 0;
        basic attack = 1;
        basic defense = 1;
        powerfull attack = 2;
        powerfull defense = 2;
        unstoppable attack = 3;
        unstoppable defense = 3;
        */
        if(attackPower > this.role.currentDefense){
            this.kill();
            GameManager.instance.completeState.gameState.addGiveInformation(this.name + " died last night, Check their grave.", true);
            this.addGiveInformation(killMessage, false);
        }else{
            this.addGiveInformation("Someone attacked you but your defense was too strong.", false);
            attacker.addGiveInformation("Your targets defense was too strong.", false);
        }
        
    }
    kill(){
        this.role.alive = false;
        GameManager.instance.getChatFromTitle("Dead").playerNames.push(this.name);
        this.grave = new GraveState(
            this.alibi,
            this.role.roleTitle,
            GameManager.instance.completeState.gameState.phase,
            GameManager.instance.completeState.gameState.dayNumber
        );
    }
}