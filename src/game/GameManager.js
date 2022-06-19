import { Main } from "../Main";
import { MainMenu } from "../menu/MainMenu";
import { OpenMenu } from "../menu/OpenMenu";
import { WaitStartMenu} from "../menu/WaitStartMenu";
import { ChatState, ChatMessageState } from "./ChatState";
import { CompleteState } from "./CompleteState";
import { PlayerState } from "./PlayerState";
import { PubNubWrapper } from "./PubNubWrapper";
import { Role } from "./Role";

export class GameManager{
    constructor(){
        this.completeState = new CompleteState();
        this.listeners = [];

        this.pubNub = new PubNubWrapper();
        this.pubNub.addMsgListener((m) => this.onMessage(m));

    }
    resetState(){
        GameManager.instance.completeState = new CompleteState();
    }
    static instance = new GameManager();

    setState(cs){
        this.completeState = cs;
        this.invokeStateUpdate();
    }
    invokeStateUpdate(){
        for(let i = 0; i < this.listeners.length; i++){
            if(this.listeners[i]) this.listeners[i].stateUpdate(this.completeState);
        }
        if(this.completeState.myState.host) this.sendGameState();
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
    sendChatMessage(myName, text, chatTitle, will){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "sendChatMessage", {
            myName : myName,
            text: text,
            chatTitle: chatTitle,
            will : will
        });
    }
    sendSaveWill(myName, will){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "saveWill", {
            myName : myName,
            will : will
        });
    }
    
    onMessage(m){
        console.log("Recieved");
        console.log(m.message);

        switch(m.message.type){
            case "test":
                break;
            case "joinRequest":
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
                break;
            case "joinResponse":
                if(this.completeState.myState.host) break;
                if(m.message.contents.success){
                    Main.instance.setState({currentMenu : <WaitStartMenu/>});
                }else{
                    alert(m.message.contents.detail);
                    Main.instance.setState({currentMenu : <OpenMenu/>});
                }
                break;
            case "gameState":
                if(this.completeState.myState.host) break;
                this.completeState.gameState = m.message.contents.gameState;
                this.invokeStateUpdate();
                break;
            case "sendChatMessage":
                if(!this.completeState.myState.host) break;
                let chat = this.getChatFromTitle(m.message.contents.chatTitle);
                chat.chatMessages.push(new ChatMessageState(
                    m.message.contents.myName,
                    Date.now(),
                    m.message.contents.text,
                    m.message.contents.will
                ));
                this.invokeStateUpdate();
                break;
            case "saveWill":
                if(!this.completeState.myState.host) break;
                let player = this.getPlayerFromName(m.message.contents.myName);
                if(player){
                    player.will = m.message.contents.will;
                    this.invokeStateUpdate();
                }
                break;
            case "kickPlayer":
                
                if(m.message.contents.name !== this.completeState.myState.name) break;

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
                this.completeState = new CompleteState();
                
                    
                break;
            case "startGame":
                //if(this.completeState.myState.host) break;
                if(m.message.contents.name === "all"||m.message.contents.name===this.completeState.myState.name)
                    Main.instance.setState({currentMenu : <MainMenu/>});
                break;
            default:
                console.log("No implemented response to type");
                break;
        };
    }
    startGame(){
        this.completeState.gameState.phase = "Day";
        this.completeState.gameState.started = true;
        //give players numbers
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            this.completeState.gameState.players[i].number = i;
        }
        //create whisper chats
        for(let i = 0; i < this.completeState.gameState.players.length; i++){
            for(let j = i+1; j < this.completeState.gameState.players.length; j++){
                this.completeState.gameState.chats.push(new ChatState(
                    "Whispers of "+this.completeState.gameState.players[i].name+" and "+this.completeState.gameState.players[j].name,
                    [this.completeState.gameState.players[i], this.completeState.gameState.players[j]]
                ));
            }
        }
        this.completeState.gameState.chats.push(new ChatState("Day", this.completeState.gameState.players));
        this.completeState.gameState.chats.push(new ChatState("Dead", this.completeState.gameState.players));
        this.completeState.gameState.chats.push(new ChatState("Mafia", this.completeState.gameState.players));
        this.completeState.gameState.chats.push(new ChatState("Vampire", this.completeState.gameState.players));
        
        this.sendStartGame();
        this.invokeStateUpdate();
    }
    playNight(){
        for(let priority = -10; priority < 10; priority++){
            //loops through priorities
            for(let i = 0; i < this.completeState.gameState.players.length; i++){
                //loops through players
                let player = this.completeState.gameState.players[i];
                let playerRole = new Role(player.role);
                playerRole.doRole(priority, player, null);
            }
        }
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
}