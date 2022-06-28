import { Main } from "../Main";
import { MainMenu } from "../menu/MainMenu";
import { OpenMenu } from "../menu/OpenMenu";
import { WaitStartMenu} from "../menu/WaitStartMenu";
import { ChatState } from "./ChatState";
import { CompleteState } from "./CompleteState";
import { PlayerState } from "./PlayerState";
import { PubNubWrapper } from "./PubNubWrapper";
import { MyRole } from "./MyRole";
import { AllPhases } from "./AllPhases";
import { AllRoles } from "./AllRoles";

export class GameManager{
    constructor(){
        this.completeState = new CompleteState();
        this.listeners = [];

        this.pubNub = new PubNubWrapper();
        this.pubNub.addMsgListener((m) => this.onMessage(m));
    }
    resetState(){
        GameManager.instance.completeState = new CompleteState();
        this.invokeStateUpdate();
    }
    static instance = new GameManager();

    setState(cs){
        this.completeState = cs;
        this.invokeStateUpdate();
    }
    invokeStateUpdate(send=true){
        for(let i = 0; i < this.listeners.length; i++){
            if(this.listeners[i]) this.listeners[i].stateUpdate(this.completeState);
        }
        if(this.completeState.myState.host && send) this.sendGameState();
    }
    addListener(l){
        this.listeners.push(l);
    }
    removeListener(l){
        for(let i = 0; i < this.listeners.length; i++){
            if(this.listeners[i] === l){
                this.listeners.splice(i);
                return;
            }
        }
    }
    
    sendGameState(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "gameState", {
            gameState: this.completeState.gameState
        });
    }
    sendJoinRequest(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "joinRequest", {
            name : this.completeState.myState.name
        });
    }
    sendJoinResponse(success, detail = "No detail"){
        this.pubNub.createAndPublish(this.completeState.gameState.roomCode, "joinResponse", {
            success: success,
            detail : detail
        });
    }
    sendKickPlayer(name){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "kickPlayer", {
            name: name
        });
    }
    sendStartGame(name="all"){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "startGame", {name: name});
    }
    sendChatMessage(text, chatTitle, type="msg", myName=this.completeState.myState.name){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "sendChatMessage", {
            myName : myName,
            text: text,
            chatTitle: chatTitle,
            type : type
        });
    }
    createSendChatMessage(text, chatTitle, type="msg", myName=this.completeState.myState.name){
        return {
            myName : myName,
            text: text,
            chatTitle: chatTitle,
            type : type
        };
    }
    sendBulkChatMessage(listMessages){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "sendBulkChatMessage", {
            listMessages : listMessages,
        });
    }
    sendSaveAlibi(alibi){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "saveAlibi", {
            myName : this.completeState.myState.name,
            alibi : alibi
        });
    }
    sendTargeting(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "targeting", {
            myName: this.completeState.myState.name,
            targeting: this.completeState.myState.targeting,
        });
    }
    sendVoting(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "voting", {
            myName: this.completeState.myState.name,
            voting: this.completeState.myState.voting,
        });
    }
    sendPhaseChange(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "phaseChange", {});
    }
    
    onMessage(m){
        //console.log("Recieved");
        //console.log(m.message);

        switch(m.message.type){
            case "test":
                break;
            case "joinRequest":
                {
                    if(!this.completeState.myState.host) break;
                    if(this.completeState.gameState.phase === "waitStart"){
                        this.completeState.gameState.players.push(new PlayerState(m.message.contents.name));
                        this.invokeStateUpdate();
                        this.sendJoinResponse(true);
                    }else if(this.completeState.gameState.started){
                        let player = this.getPlayerFromName(m.message.contents.name);
                        if(player===null){
                            this.sendJoinResponse(false, "Game started, no new players permitted");
                            break;
                        }
                        this.sendJoinResponse(true);
                        this.sendGameState();
                        this.sendStartGame(m.message.contents.name);
                        //no implemented check to ensure they should be allowed back in
                        //spectators?
                        // this.sendJoinResponse(true);
                        // this.sendStartGame();
                        // this.sendGameState();
                    }
                break;}
            case "joinResponse":
                {if(this.completeState.myState.host) break;
                if(m.message.contents.success){
                    Main.instance.setState({currentMenu : <WaitStartMenu/>});
                }else{
                    alert(m.message.contents.detail);
                    Main.instance.setState({currentMenu : <OpenMenu/>});
                }
                break;}
            case "gameState":
                {if(this.completeState.myState.host) break;
                this.completeState.gameState = m.message.contents.gameState;
                this.invokeStateUpdate();
                break;}
            case "sendChatMessage":
                {
                let chat = this.getChatFromTitle(m.message.contents.chatTitle);
                if(!chat) break;
                if(!this.completeState.myState.unreadChats.includes(chat.title))
                    this.completeState.myState.unreadChats.push(chat.title);

                if(!this.completeState.myState.host) break;
                chat.addMessage(
                    m.message.contents.myName,
                    m.message.contents.text,
                    m.message.contents.type
                );
                this.invokeStateUpdate();
                break;}
            case "sendBulkChatMessage":
                {
                    for(let i = 0; i < m.message.contents.listMessages.length; i++){
                        let chatMessage = m.message.contents.listMessages[i];
                        let chat = this.getChatFromTitle(chatMessage.chatTitle);
                        if(!chat) continue;

                        if(!this.completeState.myState.unreadChats.includes(chat.title))
                            this.completeState.myState.unreadChats.push(chat.title);

                        if(!this.completeState.myState.host) continue;
                        chat.addMessage(
                            chatMessage.myName,
                            chatMessage.text,
                            chatMessage.type
                        );
                    }
                    this.invokeStateUpdate();
                break;}
            case "saveAlibi":
                {
                    if(!this.completeState.myState.host) break;
                    let player = this.getPlayerFromName(m.message.contents.myName);
                    if(player){
                        player.alibi = m.message.contents.alibi;
                        this.invokeStateUpdate();
                    }
                break;}
            case "kickPlayer":
                {if(m.message.contents.name !== this.completeState.myState.name) break;
                    if(this.completeState.myState.host)
                    {
                        for(let i = 0; i < this.completeState.gameState.players.length; i++)
                        {
                            GameManager.instance.pubNub.createAndPublish(GameManager.instance.completeState.myState.roomCode, "kickPlayer", {
                                name: this.completeState.gameState.players[i].name
                            });
                        }
                    }
                    Main.instance.setState({currentMenu : <OpenMenu/>});
                    this.resetState();
                break;}
            case "startGame":
                {//if(this.completeState.myState.host) break;
                    if(m.message.contents.name === "all"||m.message.contents.name===this.completeState.myState.name)
                    Main.instance.setState({currentMenu : <MainMenu/>});
                break;}
            case "targeting":
                {
                    if(!this.completeState.myState.host) break;
                    let player = this.getPlayerFromName(m.message.contents.myName);
                    if(player) player.role.targeting = m.message.contents.targeting;
                    this.invokeStateUpdate();
                break;}
            case "voting":
                {
                    console.log("reece");
                    if(!this.completeState.myState.host) break;
                    let player = this.getPlayerFromName(m.message.contents.myName);
                    if(player) player.role.voting = m.message.contents.voting;

                    for(let i = 0; i < this.completeState.gameState.players.length; i++){
                        
                        let chat = this.getChatFromTitle(this.completeState.gameState.players[i].name + " Information");
                        chat.addMessage(
                            "game",
                            player.name +" is voting for "+player.role.voting[0],
                            "public information"
                        );
                    }
                    this.setVotedFor();
                    this.invokeStateUpdate();
                break;}
            case "phaseChange":
                {
                    this.completeState.myState.voting = [];
                    this.completeState.myState.targeting = [];
                    Main.instance.setState({currentMenu : <MainMenu/>});
                break;}
            default:
                console.log("No implemented response to type");
                break;
        };
    }
    startGame(roleList){
        //runs on host
        let listMessages = [];

        this.completeState.gameState.roleList = roleList;
        GameManager.shufleList(this.completeState.gameState.roleList);

        //get list of players in each chat
        let mafiaMemberNames = [];

        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            let player = this.completeState.gameState.players[i];

            //create information chats
            this.completeState.gameState.chats.push(new ChatState(player.name+" Information", [player.name]));
            //create whisper chats
            for(let j = i+1; j < this.completeState.gameState.players.length; j++){
                this.completeState.gameState.chats.push(new ChatState(
                    "Whispers of "+player.name+" and "+this.completeState.gameState.players[j].name,
                    [player, this.completeState.gameState.players[j]]
                ));
            }
            
            //give players role
            let roleTitle = this.getRoleFromGeneric(this.completeState.gameState.roleList[i]);
            player.role = new MyRole(roleTitle);
            if(AllRoles[player.role.roleTitle].faction === "Mafia") mafiaMemberNames.push(player.name);
            //Start game information
            listMessages.push(this.createSendChatMessage("Your role: \n"+roleTitle + "\n" + AllRoles[roleTitle].faction + " " + AllRoles[roleTitle].alignment, player.name+" Information", "private information", "game"));
        }
        
        
        //create chats
        let allPlayerNames = this.completeState.gameState.players.map((e)=>{return e.name});
        this.completeState.gameState.chats.push(new ChatState("Day", allPlayerNames));
        this.completeState.gameState.chats.push(new ChatState("Dead", []));
        
        this.completeState.gameState.chats.push(new ChatState("Mafia", mafiaMemberNames));
        listMessages.push(this.createSendChatMessage("The members of the mafia are:" + mafiaMemberNames.map((e)=>{
            return " \n"+e.toString() +" as the "+ this.getPlayerFromName(e).role.roleTitle;
        }), "Mafia", "public information", "game"))
        //this.completeState.gameState.chats.push(new ChatState("Vampire", allPlayerNames));

        GameManager.shufleList(this.completeState.gameState.roleList);

        this.startPhase("Night");
        this.completeState.gameState.started = true;

        this.sendStartGame();
        this.invokeStateUpdate();
        this.sendBulkChatMessage(listMessages);
        this.tick();
    }

    tick(){
        if(!this.completeState.myState.host || !this.completeState.gameState.started) return;

        this.completeState.gameState.phaseTimer--;

        if(this.completeState.gameState.phaseTimer === 0){
            console.log(this.completeState.gameState.phase + " timeout");
            AllPhases[this.completeState.gameState.phase].timeOut();
        }

        setTimeout(()=>{
            this.tick();
        }, 1000);
    }

    getRoleFromGeneric(generic){

        if(generic === null || generic===undefined)
            return this.getRoleFromGeneric({faction:"Random",alignment:"Random"});
        //handle exact role
        if(generic.faction in AllRoles){
            return generic.faction;
        }

        //handle random faction
        if(generic.faction === "Random"){
            let allFactions = this.getFactionList();
            return this.getRoleFromGeneric({
                faction: allFactions[Math.floor(Math.random()*allFactions.length)],
                alignment: "Random"
            });
        }
        //by here, we know the faction. so handle random alignment
        if(generic.alignment === "Random"){
            let allAlignments = this.getAlignmentList(generic.faction);
            return this.getRoleFromGeneric({
                faction: generic.faction,
                alignment: allAlignments[Math.floor(Math.random()*allAlignments.length)]
            });
        }

        //handle case where we know faction and alignment
        let roles = this.getFactionAlignmentList(generic.faction, generic.alignment);
        return roles[Math.floor(Math.random()*roles.length)];
    }
    getFactionList(){
        let output = [];
        for(let role in AllRoles){
            if(!output.includes(AllRoles[role].faction))
                output.push(AllRoles[role].faction);
        }
        return output;
    }
    getAlignmentList(faction){
        let output = [];
        for(let role in AllRoles){
            if(AllRoles[role].faction === faction && !output.includes(AllRoles[role].alignment))
                output.push(AllRoles[role].alignment);
        }
        return output;
    }
    getFactionAlignmentList(faction, alignment){
        let output = [];
        for(let role in AllRoles){
            if(AllRoles[role].faction === faction && AllRoles[role].alignment === alignment)
                output.push(role);
        }
        return output;
    }

    startPhase(str){
        this.completeState.gameState.phase = str;
        this.completeState.gameState.phaseTimer = AllPhases[str].phaseTime;
        
        //send information that phase changed
        let listMessages = [];
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            listMessages.push(this.createSendChatMessage(
                str+" "+this.completeState.gameState.dayNumber,
                this.completeState.gameState.players[i].name + " Information", "public information", "game"
            ));
        }
        this.sendBulkChatMessage(listMessages);
        this.invokeStateUpdate();
        this.sendPhaseChange();
        //AllPhases[str].onStart();
    }

    getChatFromTitle(title){
        for(let i = 0; i < this.completeState.gameState.chats.length; i++)
        {
            if(this.completeState.gameState.chats[i].title === title){
                return this.completeState.gameState.chats[i];
            }
        }
        return null;
    }
    getPlayerFromName(name){
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            if(this.completeState.gameState.players[i].name === name)
                return this.completeState.gameState.players[i];
        }
        return null;
    }
    getPlayerByRole(roleTitle){
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            if(this.completeState.gameState.players[i].role.roleTitle === roleTitle)
                return this.completeState.gameState.players[i];
        }
        return null;
    }

    setVotedFor(){
        let aliveCount = 0;
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            // reset votes
            this.completeState.gameState.players[i].role.votedFor = [];
            //count alive
            if(this.completeState.gameState.players[i].role.alive) aliveCount++;
        }
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            for(let j = 0; j < this.completeState.gameState.players[i].role.voting.length; j++){
                this.getPlayerFromName(this.completeState.gameState.players[i].role.voting[j]).role.votedFor.push(this.completeState.gameState.players[i].name);
            }
        }

        //switch phase
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            //check if votes add up high enough
            if(this.completeState.gameState.players[i].role.votedFor.length >= (Math.floor(aliveCount/2) + 1)){

                this.completeState.gameState.onTrial = this.completeState.gameState.players[i].name;
                this.startPhase("Testimony");
                
                let listMessages = [];
                for(let j = 0; j < this.completeState.gameState.players.length; j++){
                    listMessages.push(this.createSendChatMessage(
                        this.completeState.gameState.onTrial + " is on trial, be quiet and allow them to defend themselves.",
                        this.completeState.gameState.players[j].name + " Information", "public information", "game"
                    ));
                }
                this.sendBulkChatMessage(listMessages);
                return;
            }
        }
        
    }

    static shufleList(l){
        for(let i = 0; i < l.length; i++){
            let r = Math.floor(Math.random()*l.length);
            let t = l[r];
            l[r] = l[i];
            l[i] = t;
        }
    }
    static generateRandomString(length){
        let allChars = "abcdefghijklmnopqrstuvwxyz1234567890";
        let out = "";

        for(let i = 0; i < length; i++)
        {
            let r = Math.random()*allChars.length;
            out+=allChars.substring(r, r+1);
        }
        return out;
    }
    static deepCopy(original) {
        if (Array.isArray(original)) {
          return original.map(elem => GameManager.deepCopy(elem));
        }
        else if (typeof original === 'object' && original !== null){
          return Object.fromEntries(
            Object.entries(original)
              .map(([k, v]) => [k, GameManager.deepCopy(v)]));
        }
        else{
          // Primitive value: atomic, no need to copy
          return original;
        }
    }
}
