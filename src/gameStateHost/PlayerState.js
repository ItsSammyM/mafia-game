import GameManager from "../game/GameManager";
import { ROLES } from "../game/ROLES";
import { ChatMessageState } from "./ChatMessageState";
import { CycleVariable } from "./CycleVariable";

export class PlayerState{
    constructor(name){
        this.name = name;

        this.chatMessageList = [];
        this.unsentChatMessageStream = [];
        this.unsentChatMessageStreamBufferLength = 10;

        this.chatGroupSendList = [];

        /*
            {
                "otherPlayerName":{target:false,whisper:false,vote:false}
            }
        */
        this.availableButtons = {};
        
        /*
            {
                "otherPlayerName":["Dead", "Mayor"]
            }
        */
        this.suffixes = {};//what i see other players as


        this.savedNotePad = {};

        this.roleName = null;
        this.alive = true;

        this.cycleVariables = {
            votedBy : new CycleVariable('Voting', []),
            voting : new CycleVariable('Voting', null),

            judgement : new CycleVariable('Judgement', 0),

            targetedBy : new CycleVariable('Night', []),
            targeting : new CycleVariable('Night', []),

            aliveTonight : new CycleVariable('Night', this.alive),

            roleblockedTonight : new CycleVariable('Night', false),
            defenseTonight : new CycleVariable('Night', this.getRoleObject().defense),
            attackTonight : new CycleVariable('Night', this.getRoleObject().attack),
            isSuspiciousTonight : new CycleVariable('Night', this.getRoleObject().isSuspicious),
            disguisedAsTonight : new CycleVariable('Night', null),

            extra : new CycleVariable('Night', {
                //idk this is for weird stuff exclusively
                healedByDoc : false,
                attackedTonight : false,
                isVeteranOnAlert : false,
                blackmailed : false,
                //savedByBodyguard : false,
                //killedTonight : false
            }),

            nightInformation : new CycleVariable('Night', []),

            shownRoleName : new CycleVariable('Night', this.persist.roleName),
            shownWill : new CycleVariable('Night', this.savedNotePad['Will']),


            attackedBy : [],

            
        };
    }
    setUpAvailableButtons(players){
        for(let playerName in players){
            this.availableButtons[playerName] = {target:false, whisper: false, vote:false};
            this.suffixes[playerName] = [];
        }
    }

    //#region ChatMessages
    addChatMessage(m){
        this.chatMessageList.push(m);
        this.unsentChatMessageStream.push(m)
    }
    addChatMessages(m){
        for(let i in m){
            this.addChatMessage(m[i]);
        }
    }
    copyChatMessagesToUnsentMessages(){
        for(let i in this.chatMessageList){
            this.unsentChatMessageStream.push(this.chatMessageList[i]);
        }
    }
    getUnsentChatMessages(){
        return this.unsentChatMessageStream.splice(0,this.unsentChatMessageStreamBufferLength);
    }
    //#endregion

    addSuffix(playerWithSuffix, suffix){
        if(!this.suffixes[playerWithSuffix].includes(suffix))
            this.suffixes[playerWithSuffix].push(suffix);
    }

    //#region Role
    createPlayerRole(roleName){
        this.roleName = roleName;   //SET PERSIST STUFF SO INCOMPLETE
        this.addChatMessage(new ChatMessageState(
            this.getRoleObject().faction+" "+this.getRoleObject().alignment+", "+this.roleName, 
            this.getRoleObject().basicDescription, 
            GameManager.COLOR.GAME_TO_YOU
        ));
    }
    getRoleObject(){
        return ROLES[this.roleName];
    }
    doMyRole(priority){
        if(!this.roleName) return;
        if(priority === null) return;
        if(this.cycle.roleblocked && this.getRoleObject().roleblockable) return; //if your roleblocked---this needs to be moved so INCOMPLETE
        this.getRoleObject().doRole(priority, this);
    }
    resetCycleVariables(phaseName){
        CycleVariable.objectResetIfPhase(this.cycleVariables, phaseName);
    }
    //#endregion
    //#region Target
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
    canTargetList(){
        let canTargetList = [];
        for(let otherPlayerName in GameManager.host.players){
            let otherPlayer = GameManager.host.players[otherPlayerName];

            if(this.role.getRoleObject().canTargetFunction(this, otherPlayer)) 
                canTargetList.push(otherPlayerName);
        }
        return canTargetList;
    }
    //#endregion
    //#region Vote
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
    canVoteList(){
        let canVoteList = [];
        for(let otherPlayerName in GameManager.host.players){
            let otherPlayer = GameManager.host.players[otherPlayerName]
            if(this.canVote(otherPlayer))
                canVoteList.push(otherPlayerName);
        }
        return canVoteList;
    }
    //#endregion


    //#region Helper functions
    roleblock(){
        this.cycleVariables.roleblocked.value = true;
        if(!this.getRoleObject().roleblockable)
            this.addNightInformation(
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
        this.role.persist.cycleDied = GameManager.host.cycleNumber;

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

    //[ChatMessageState, boolean]
    //Information, roleSpecific
    addNightInformation(chatMessageState, roleSpecific){
        this.cycleVariables.nightInformation.value.push(   [chatMessageState, roleSpecific]    );
    }
    addNightInformationList(nightInformationList){
        for(let i in nightInformationList)
            this.cycleVariables.nightInformation.value.push(  nightInformationList[i]    );
    }
    //#endregion    
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
            cycleDied : null,
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
            disguisedAs : null,

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