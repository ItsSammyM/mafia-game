import GameManager from "../game/GameManager";
import { ROLES } from "../game/ROLES";
import { ChatMessageState } from "./ChatMessageState";

export class PlayerState{
    constructor(name){
        this.name = name;
        this.chatMessageList = [];
        this.availableButtons = {};
        /*
            {
                "Name":{target:false,whisper:false,vote:false}
            }
        */
        this.role = null;
        this.suffixes = [];
    }
    canVote(otherPlayer){
        if(
            this.name !== otherPlayer.name &&
            this.role.persist.alive &&
            otherPlayer.role.persist.alive &&
            this.role.cycle.voting !== otherPlayer
        ){
            this.availableButtons[otherPlayer.name].vote = true;
        }else{
            this.availableButtons[otherPlayer.name].vote = false;
        }
            
        return this.availableButtons[otherPlayer.name].vote;
    }
    addMessage(m){
        this.chatMessageList.push(m);
    }
    addMessages(m){
        for(let i in m){
            this.chatMessageList.push(m[i]);
        }
    }
    setUpAvailableButtons(players){
        for(let playerName in players){
            this.availableButtons[playerName] = {target:false, whisper: false, vote:false};
        }
    }
    createPlayerRole(exact){
        this.role = new PlayerRole(exact);
    }
    doMyRole(priority){
        if(!this.role) return;
        this.role.doMyRole(priority, this);
    }
    /**
     * Adds new player to end of targeting list only if role allows
     * if canTargetFunction returns true then push to list
     * @param {PlayerState} otherPlayer 
     * @returns Null
     */
    addTarget(otherPlayer){
        if(!this.role.getRoleObject().canTargetFunction(this, otherPlayer)) return;
        this.role.cycle.targeting.push(otherPlayer);
    }
    /**
     * Makes it so the player is targeting nobody
     * sets targeting to = []
     * returns true if there were people targeted in the first place
     */
    clearTarget(){
        this.role.cycle.targeting = [];
    }
    roleblock(){
        this.role.cycle.roleblocked = true;
        if(!this.role.getRoleObject().roleblockable) this.role.cycle.nightInformation.push(new ChatMessageState(null, "Someone attempted to roleblock you but you were immune.", GameManager.COLOR.GAME_TO_YOU));
        else this.role.cycle.nightInformation.push(new ChatMessageState(null, "You were roleblocked.", GameManager.COLOR.GAME_TO_YOU));
    }
    tryNightKill(attacker, attackPower){
        if(this.role.cycle.defense >= attackPower){
            //safe
            attacker.role.cycle.nightInformation.push(new ChatMessageState(null, "Your target had defense and survived.", GameManager.COLOR.GAME_TO_YOU));
            this.role.cycle.nightInformation.push(new ChatMessageState(null, "You were attacked but had defense and survived.", GameManager.COLOR.GAME_TO_YOU));
        }else{
            //die
            this.role.cycle.nightInformation.push(new ChatMessageState(null, "You were attacked and died.", GameManager.COLOR.GAME_TO_YOU));
            this.die();
        }
        
    }
    die(){
        this.suffixes.push("died");
        this.role.persist.alive = false;
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
    doMyRole(priority, player){

        if(priority === null) return;
        if(this.cycle.roleblocked && this.getRoleObject().roleblockable) return; //if your roleblocked
        
        this.getRoleObject().doRole(priority, player);
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
                // diedOnCycle : 2
            }
        };
        //copy extra persist over from role
        for(let key in ROLES[roleName].persist){
            this.persist.extra[key] = ROLES[roleName].extraPersist[key];
        }
    }
    /**
     * runs at morning end
     */
    setCycle(){
        this.cycle = {
            votedBy: [],
            voting: null,

            judgement : 0,

            targetedBy : [],
            targeting : [],

            roleblocked : false,
            aliveNow : this.persist.alive,

            defense : ROLES[this.persist.roleName].defense,
            isSuspicious : ROLES[this.persist.roleName].isSuspicious,

            nightInformation : [],

            extra : {
                //idk this is for weird stuff exclusively
                //healedByDoc : false,
                //savedByBodyguard : false,
                //killedTonight : false
            },
            
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