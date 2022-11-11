import GameManager from "../game/GameManager";
import { ROLES } from "../game/ROLES";
import { ChatMessageState } from "./ChatMessageState";

export class PlayerState{
    constructor(name){
        this.name = name;
        this.chatMessageList = [];
        this.unsentMessageStream = [];
        this.unsentMessageStreamBufferLength = 10;

        this.chatGroupSendList = [];

        this.role = null;

        this.savedNotePad = {};

        this.availableButtons = {};
        /*
            {
                "Name":{target:false,whisper:false,vote:false}
            }
        */
        this.suffixes = {};//what i see other players as
        /*
        {
            "otherPlayerName":["Dead", "Mayor"]
        }
        */
    }
    addMessage(m){
        this.chatMessageList.push(m);
        this.unsentMessageStream.push(m)
    }
    addMessages(m){
        for(let i in m){
            this.addMessage(m[i]);
        }
    }
    copyMessagesToUnsentMessages(){
        for(let i in this.chatMessageList){
            this.unsentMessageStream.push(this.chatMessageList[i]);
        }
    }
    getUnsentMessages(){
        return this.unsentMessageStream.splice(0,this.unsentMessageStreamBufferLength);
    }

    setUpAvailableButtons(players){
        for(let playerName in players){
            this.availableButtons[playerName] = {target:false, whisper: false, vote:false};
            this.suffixes[playerName] = [];
        }
    }

    addSuffix(playerWithSuffix, suffix){
        if(!this.suffixes[playerWithSuffix].includes(suffix))
            this.suffixes[playerWithSuffix].push(suffix);
    }

    createPlayerRole(exact){
        this.role = new PlayerRole(exact);
        this.addMessage(
            new ChatMessageState(
                this.role.getRoleObject().faction+" "+this.role.getRoleObject().alignment+", "+this.role.persist.roleName, 
                this.role.getRoleObject().basicDescription, 
                GameManager.COLOR.GAME_TO_YOU
            )
        );
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
        if(!this.role.getRoleObject().roleblockable)
            this.role.addNightInformation(
                new ChatMessageState(null, "Someone attempted to roleblock you but you were immune", GameManager.COLOR.GAME_TO_YOU), false
            );
        else 
            this.role.addNightInformation(new ChatMessageState(null, "You were roleblocked", GameManager.COLOR.GAME_TO_YOU), false);
    }
    tryNightKill(attacker, attackPower){
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
        */

        this.role.cycle.attackedTonight = true;
        this.role.cycle.attackedBy.push(attacker);
        if(this.role.cycle.defense >= attackPower){
            //safe
            attacker.role.addNightInformation(new ChatMessageState(null, "Your target had defense and survived", GameManager.COLOR.GAME_TO_YOU), false);
            this.role.addNightInformation(new ChatMessageState(null, "You were attacked but had defense and survived", GameManager.COLOR.GAME_TO_YOU), false);
            
        }else{
            //die
            this.role.addNightInformation(new ChatMessageState(null, "You were attacked and died", GameManager.COLOR.GAME_TO_YOU), false);
            this.die();
        }
        
    }
    die(){
        //ADD TO DEAD CHAT
        GameManager.host.chatGroups["Dead"].push(this);

        this.role.persist.alive = false;

        GameManager.host.swapMafioso();
        //GameManager.host.checkEndGame();
    }
    showDied(){
        let publicInformation = [];
        let killedByString = "";
        for(let i in this.role.cycle.attackedBy){
            let attacker = this.role.cycle.attackedBy[i];
            if(attacker.role.getRoleObject().team){
                killedByString+=attacker.role.getRoleObject().team+", ";
            }else{
                killedByString+=attacker.role.persist.roleName+", ";
            }
        }
        if(killedByString.length > 2) killedByString = killedByString.substring(0, killedByString.length-2);

        publicInformation.push(new ChatMessageState(this.name+" died", "They were killed by "+killedByString, GameManager.COLOR.GAME_TO_ALL));
        publicInformation.push(new ChatMessageState(this.name+" died", "Their role was "+this.role.cycle.shownRoleName, GameManager.COLOR.GAME_TO_ALL));
        publicInformation.push(new ChatMessageState(this.name+" died", "Their final will: "+this.role.cycle.shownWill, GameManager.COLOR.GAME_TO_ALL));

        for(let playerName in GameManager.host.players){
            let player = GameManager.host.players[playerName];

            //all other players ... should see on me,,,, that i died
            player.addSuffix(this.name, "Died");
            player.addSuffix(this.name, this.role.cycle.shownRoleName);
            player.addMessages(publicInformation);
        }
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
            will : "",
            extra: {
                doused : false,
                // framed : false,
                // revealed : false,

                // selfHealed : false,
                // diedOnCycle : 2
            },
            roleExtra: {}
        };
        //copy extra persist over from role
        
        if(!ROLES[roleName]) console.log(roleName)
        for(let key in ROLES[roleName].extraPersist){
            this.persist.roleExtra[key] = ROLES[roleName].extraPersist[key];
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
            attack : ROLES[this.persist.roleName].attack,
            isSuspicious : ROLES[this.persist.roleName].isSuspicious,

            shownRoleName : this.persist.roleName,
            shownWill : "",
            shownNote : "",


            nightInformation : [],

            attackedBy : [],

            extra : {
                //idk this is for weird stuff exclusively
                healedByDoc : false,
                attackedTonight : false,
                isVeteranOnAlert : false,
                blackmailed : false,
                //savedByBodyguard : false,
                //killedTonight : false
            },
        }
    }
    addNightInformation(chatMessageState, roleSpecific){
        this.cycle.nightInformation.push(   [chatMessageState, roleSpecific]    );
    }
    addNightInformationList(nightInformationList){
        for(let i in nightInformationList){
            this.cycle.nightInformation.push(  nightInformationList[i]    );
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