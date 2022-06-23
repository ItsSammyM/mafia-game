import { GameManager } from "../game/GameManager";
import { ChatMenu } from "./ChatMenu";
import { Main } from "../Main";
import React from "react";
import { AlibiMenu } from "./AlibiMenu";

export class MainMenu extends React.Component
{
    constructor(props){
        super(props);
        this.state = {
            completeState : GameManager.instance.completeState,
        };
        this.stateListener = {stateUpdate :(s) => { 
            this.setState({completeState : s});
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    renderPlayer(player){
        if(player.name === this.state.completeState.myState.name) return;
  
        let whisperButtonBool=false;
        let targetButtonBool=false;
        let voteButtonBool=false;
        let whisperChat = null;

        let buttonCount = 0;
        let buttonPressed = false;
        let number = 0;
        let buttonClassName = "Main-button";
        if(this.state.completeState.gameState.phase === "Voting"){ buttonCount++; voteButtonBool=true;
            for(let i = 0; i < this.state.completeState.myState.voting.length; i++){
                if(this.state.completeState.myState.voting[i] === player.name){
                    buttonClassName += "-pressed";
                    buttonPressed = true;
                    break;
                }
            }
        }
        if(this.state.completeState.gameState.phase === "Night"){ buttonCount++; targetButtonBool=true;
            for(let i = 0; i < this.state.completeState.myState.targeting.length; i++){
                if(this.state.completeState.myState.targeting[i] === player.name){
                    buttonClassName += "-pressed";
                    buttonPressed = true;
                    number = i+1;
                    break;
                }
            }
        }
        if(this.state.completeState.gameState.phase !== "Night"){ buttonCount++; whisperButtonBool=true;
            let chatTitle = "Whispers of ";
            let count = 0;
            for(let i = 0; i < this.state.completeState.gameState.players.length; i++){
                if(
                    this.state.completeState.gameState.players[i].name === player.name || 
                    this.state.completeState.gameState.players[i].name === this.state.completeState.myState.name
                ){
                    count++;
                    chatTitle += this.state.completeState.gameState.players[i].name;
                    if(count===1) chatTitle+=" and ";
                    if(count===2) break;
                }
            }
            whisperChat = GameManager.instance.getChatFromTitle(chatTitle);
        }
        
        let buttonWidth = (1.0 / buttonCount * 100)+"%"

        let whisperButton = ()=>{if(whisperButtonBool) return(
        <div style={{display: "inline-block", width:buttonWidth}}>
            <button className={buttonClassName} style={{width:"100%"}} onClick={()=>{
                Main.instance.setState({currentMenu: <ChatMenu chat={whisperChat}/>});
            }}>Whisper</button></div>);
        return;}
        let voteButton = ()=>{if(voteButtonBool) return(
            <div style={{display: "inline-block", width:buttonWidth}}>
                <button className={"Main-button" + (buttonPressed ? "-pressed" : "")} style={{width:"100%"}} onClick={()=>{
                    if(buttonPressed){
                        let i = GameManager.instance.completeState.myState.voting.indexOf(player.name);
                        if(i!==-1) GameManager.instance.completeState.myState.voting.splice(i,1);
                    }else{
                        GameManager.instance.completeState.myState.voting = [];
                        GameManager.instance.completeState.myState.voting.push(player.name);
                    }
                    GameManager.instance.invokeStateUpdate();
                }}>Vote</button>
            </div>);
        return;}
        let targetButton = ()=>{if(targetButtonBool) return(
            <div style={{display: "inline-block", width:buttonWidth}}>
                <button className={"Main-button" + (buttonPressed ? "-pressed" : "")} style={{width:"100%"}} onClick={()=>{
                    if(buttonPressed){
                        let i = GameManager.instance.completeState.myState.targeting.indexOf(player.name);
                        if(i!==-1) GameManager.instance.completeState.myState.targeting.splice(i,1);
                    }else{
                        GameManager.instance.completeState.myState.targeting.push(player.name);
                    }
                    GameManager.instance.invokeStateUpdate(false);
                    GameManager.instance.sendTargeting();
                }}>{"Target" + (buttonPressed ? ": "+number:"")}</button>
            </div>); 
        return;}

        return(
            <div key={player.name} style={{display: "inline-block", width:"90.7%"}}>
                {player.name}
                {whisperButton()}
                {voteButton()}
                {targetButton()}
            </div>
        );
    }
    renderChat(chatTitle){
        let chat = GameManager.instance.getChatFromTitle(chatTitle);
        if(chat===null) return;
        for(let i = 0; i < chat.playerNames.length; i++){
            if(chat.playerNames[i] === this.state.completeState.myState.name){
                return(
                    <div>
                        <button className="Main-button" onClick={() => Main.instance.setState({currentMenu: <ChatMenu chat={chat}/>})}>{chatTitle}</button>
                        <br/>
                    </div>
                )
            }
        }
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-body">
                <br/>
                <div>
                    <div className = "Main-header">
                        Main
                    </div>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                        <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}} onClick={()=>Main.instance.setState({currentMenu : <ChatMenu chat={this.state.completeState.myState.name + " Information"}/>})}>Information</button></div>
                        <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}} onClick={()=>Main.instance.setState({currentMenu : <AlibiMenu/>})}>Alibi</button></div>
                        <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Target</button></div>
                    </div>
                    <br/>
                    <button className="Main-button">Graveyard</button>
                    <br/>
                </div>
                <br/>
                <div>
                    <div className = "Main-header">
                        Chats
                    </div>
                    {this.renderChat("Day")}
                    {this.renderChat("Dead")}
                    {this.renderChat("Mafia")}
                </div>
                <br/>
                <div>
                    <div className = "Main-header">
                        Players
                    </div>
                    {this.state.completeState.gameState.players.map((p) => this.renderPlayer(p))}
                    <br/>
                </div>
                <br/>
                <button className="Main-button">Wiki</button><br/>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}