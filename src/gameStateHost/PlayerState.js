import { ROLES } from "../game/ROLES";

export class PlayerState{
    constructor(name){
        this.name = name;
        this.availableButtons = {};
        /*
            {
                "Name":{target:false,whisper:false,vote:false}
            }
        */
        this.role = null;
    }
    setUpAvailableButtons(players){
        for(let playerName in players){
            this.availableButtons[playerName] = {target:false, whisper: false, vote:false};
        }
    }
    createPlayerRole(exact){
        this.role = new PlayerRole(exact);
    }
    addTarget(otherPlayer){
        if(!this.role.getRoleObject().canTargetFunction(this, otherPlayer)) return;
        this.role.cycle.targeting.push(otherPlayer);
    }
    clearTarget(){
        this.role.cycle.targeting = [];
    }
}
export class PlayerRole{
    constructor(_roleName){
        this.setPersist(_roleName);
        this.setCycle();
    }
    getRoleObject(){
        return ROLES[this.persist.roleName];
    }
    doMyRole(priority){

        if(priority === null || this.cycle.roleblocked) return;
        
        this.getRoleObject().doRole(priority, this);
    }
    setPersist(roleName){
        this.persist = {
            alive : true,
            roleName : roleName,
            extra: {
                // doused : false,
                // framed : false,
                // revealed : false,
                // selfHealed : false,
            }
        };
        //copy extra persist over from role
        for(let key in ROLES[roleName].persist){
            this.persist.extra[key] = ROLES[roleName].extraPersist[key];
        }
    }
    //runs right after night
    setCycle(){
        this.cycle = {
            votedBy: [],
            voting: "",

            targetedBy : [],
            targeting : [],

            roleBlocked : false,
            aliveNow : this.persist.alive,

            defense : ROLES[this.persist.roleName].defense,
            isSuspicious : ROLES[this.persist.roleName].isSuspicious,

            extra : {
                //idk this is for weird stuff exclusively
                //healedByDoc
                //savedByBodyguard
                //
            }
        }
    }
}
/*
this.name = _name;
this.basicDescription = _basicDescription;

this.faction = _faction;
this.team = _team;
this.alignment = _alignment;

this.defense=_defense;

this.roleblockable=_roleblockable;
this.witchable=_witchable;

this.isSuspicious=_isSuspicious;

this.extraPersist=_extraPersist;
this.doRole=_doRole;
*/

/*
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
        no attack = 0;
        no defense = 0;
        basic attack = 1;
        basic defense = 1;
        powerfull attack = 2;
        powerfull defense = 2;
        unstoppable attack = 3;
        unstoppable defense = 3;

        defense always wins over attack.. If == then no kill
        
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
*/