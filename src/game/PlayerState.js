import { AllRoles } from "./AllRoles";
import { GameManager } from "./GameManager";

export class PlayerState{
    constructor(name)
    {
        this.name = name;
        this.alibi = "";
        this.role = null;

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
        if(this.getMyRole().roleblockable && !this.role.roleblocked){
            this.role.roleblocked = true;
            this.addGiveInformation("You were Roleblocked! Your ability might not have worked.", false);
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
            this.addGiveInformation(killMessage, false);
        }else{
            this.addGiveInformation("Someone attacked you but your defense was too strong.", false);
            attacker.addGiveInformation("Your targets defense was too strong.", false);
        }
        
    }
    kill(){
        this.role.alive = false;
        GameManager.instance.getChatFromTitle("Dead").playerNames.push(this.name);
    }
}