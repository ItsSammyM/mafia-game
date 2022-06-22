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
        if(this.state.completeState.gameState.phase === "Voting"){ buttonCount++; voteButtonBool=true;}
        if(this.state.completeState.gameState.phase === "Night"){ buttonCount++; targetButtonBool=true;}
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

        let whisperButton = ()=>{if(whisperButtonBool) return(<div style={{display: "inline-block", width:buttonWidth}}><button className="Main-button" style={{width:"100%"}} 
            onClick={()=>{Main.instance.setState({currentMenu: <ChatMenu chat={whisperChat}/>});
        }}>Whisper</button></div>); return;}
        let voteButton = ()=>{if(voteButtonBool) return(<div style={{display: "inline-block", width:buttonWidth}}><button className="Main-button" style={{width:"100%"}}>Vote</button></div>); return; }
        let targetButton = ()=>{if(targetButtonBool) return(<div style={{display: "inline-block", width:buttonWidth}}><button className="Main-button" style={{width:"100%"}}>Target</button></div>); return;}

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
                        <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Information</button></div>
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