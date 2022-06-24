import { AllRoles } from "./AllRoles";

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
    addGiveInformation(information, isPublic){
        this.giveInformation.push({
            information : information,
            isPublic : isPublic
        });
    }
    cycleReset(){
        this.role.cycleReset();
        this.giveInformation = [];
    }

    getMyRole(){
        return AllRoles[this.role.roleTitle];
    }

    doMyRole(priority){
        if(this.role.roleblocked) console.log("Roleblocked" + this.name);
        if(this.role===null || priority === null || this.role.roleblocked) return;
        this.getMyRole().doRole(priority, this);
    }
    roleBlock(){
        if(this.getMyRole().roleblockable && !this.role.roleblocked){
            this.role.roleblocked = true;
            this.addGiveInformation("You were Roleblocked! Your ability might not have worked.", false);
        }
    }
    nightKill(killMessage="You've been murdered! You may speak with the other dead."){
        this.kill();
        this.addGiveInformation(killMessage, false);
    }
    kill(){
        this.role.alive = false;
    }
}