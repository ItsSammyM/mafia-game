import { GameManager } from "../game/GameManager";
import { ChatMenu } from "./ChatMenu";
import { Main } from "../Main";
import React from "react";
import { AlibiMenu } from "./AlibiMenu";
import { GraveyardMenu } from "./GraveyardMenu";

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
  
        let whisperButtonBool=false;
        let targetButtonBool=false;
        let voteButtonBool=false;

        let buttonCount = 1;
        
        if(this.state.completeState.gameState.phase === "Vote"){
            buttonCount++;
            voteButtonBool=true;
        }
        if(this.state.completeState.gameState.phase === "Night"){
            buttonCount++;
            targetButtonBool=true;
        }
        if(player.name !== this.state.completeState.myState.name){
            buttonCount++; 
            whisperButtonBool=true;
        }
        
        let buttonWidth = (1.0 / buttonCount * 100)+"%"

        let nameString = player.name;
        if(player.name === this.state.completeState.myState.name) nameString+=" (Self)";
        // if(player && player.getMyRole()){
        //     if(player.role.alive === false) nameString+= " (Dead)";
        //     if(//if were both mafia
        //         player.getMyRole().faction === "Mafia" && 
        //         GameManager.instance.getPlayerFromName(this.state.completeState.myState.name).getMyRole().faction==="Mafia"
        //     )
        //         nameString+= " ("+player.role.roleTitle+")";
        //     if(//if were both coven
        //         player.getMyRole().faction === "Coven" && 
        //         GameManager.instance.getPlayerFromName(this.state.completeState.myState.name).getMyRole().faction==="Coven"
        //     )
        //         nameString+= " ("+player.role.roleTitle+")";
        // }
        
        return(
            <div key={player.name} style={{display: "inline-block", width:"90.7%", textAlign: "left"}}>
                {nameString+": "}
                {whisperButtonBool ? this.renderWhisper(player, buttonWidth) : null}
                {voteButtonBool ? this.renderVote(player, buttonWidth) : null}
                {targetButtonBool ? this.renderTarget(player, buttonWidth) : null}
            </div>
        );
    }
    renderWhisper(player, buttonWidth){
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
        let whisperChat = GameManager.instance.getChatFromTitle(chatTitle);

        let s = "";
        if(this.state.completeState.myState.unreadChats.includes(chatTitle))
            s+="-notification";
        return(
            <div style={{display: "inline-block", width:buttonWidth}}>
                <button className={"Main-button"+s} style={{width:"100%"}} 
                onClick={()=>{Main.instance.setState({currentMenu: <ChatMenu chat={whisperChat}/>});}}
                >Whisper</button>
            </div>
        );
    }
    renderVote(player, buttonWidth){
        let numVotes = player.role.votedFor.length;
        let buttonPressed = false;

        if(this.state.completeState.myState.voting.includes(player.name)){
            buttonPressed = true;
        }
        
        if(player.name !== this.state.completeState.myState.name)
            return(
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
                        GameManager.instance.sendVoting();
                    }}>{"Vote: " + numVotes}</button>
                </div>
            );
        return(
            <div style={{display: "inline-block", width:buttonWidth}}>
                <button className={"Main-button" + (buttonPressed ? "-pressed" : "")} style={{width:"100%", color:"#dd0000"}}>{"Vote: " + numVotes}</button>
            </div>
        );
    }
    renderTarget(player, buttonWidth){
        let buttonPressed = false;
        let number = 0;
        let targetIndex = this.state.completeState.myState.targeting.indexOf(player.name);
        if(targetIndex !== -1){
            buttonPressed = true;
            number = targetIndex+1;
        }

        return(
            <div style={{display: "inline-block", width:buttonWidth}}>
                <button className={"Main-button" + (buttonPressed ? "-pressed" : "")} style={{width:"100%"}} onClick={()=>{
                    if(buttonPressed){
                        let i = GameManager.instance.completeState.myState.targeting.indexOf(player.name);
                        if(i!==-1) GameManager.instance.completeState.myState.targeting.splice(i,1);
                    }else{
                        GameManager.instance.completeState.myState.targeting.push(player.name);
                    }
                    GameManager.instance.invokeStateUpdate();
                    GameManager.instance.sendTargeting();
                }}>{"Target" + (buttonPressed ? ": "+number:"")}</button>
            </div>
        );
    }
    renderChat(chatTitle){
        let chat = GameManager.instance.getChatFromTitle(chatTitle);
        if(chat===null) return;
        let s = "";
        if(this.state.completeState.myState.unreadChats.includes(chatTitle))
            s+="-notification";
        //check if im in the chat
        if(chat.playerNames.includes(this.state.completeState.myState.name))
            return(
                <div>
                    <button className={"Main-button"+s} onClick={() => {Main.instance.setState({currentMenu: <ChatMenu chat={chat}/>})}}>
                        {chatTitle}</button>
                    <br/>
                </div>
            );
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-body">
                <br/>
                <div>
                    <div className = "Main-header">
                        {!this.state.completeState.gameState.started ? ("Main") : (
                            this.state.completeState.gameState.phase
                        )}
                    </div>
                    <div className = "Main-header" style={{color:"#aa0000"}}>
                        {
                            (this.state.completeState.gameState.phase === "Testimony" || this.state.completeState.gameState.phase === "Judgement" ) ?
                            (this.state.completeState.gameState.onTrialName + " is on trial, let them be heard!") : ("")
                        }
                        {
                            (this.state.completeState.gameState.phase === "Judgement" ) ?
                            (<div style={{WebkitTextStroke: "0px rgb(0,0,0)", display: "inline-block", width:"90.7%"}}>
                                <button className="Main-button" style={{color:"#00aa00", display: "inline-block", width:"33%"}}>
                                    Innocent
                                </button>
                                <button className="Main-button" style={{color:"#4c34eb", display: "inline-block", width:"33%"}}>
                                    Abstain
                                </button>
                                <button className="Main-button" style={{color:"#aa0000", display: "inline-block", width:"33%"}}>
                                    Guilty
                                </button>
                            </div>) : ("")
                        }
                    </div>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className={"Main-button"+(this.state.completeState.myState.unreadChats.includes(this.state.completeState.myState.name + " Information") ? "-notification":"")}style={{width:"100%"}} 
                                onClick={()=>Main.instance.setState({currentMenu : <ChatMenu chat={GameManager.instance.getChatFromTitle(this.state.completeState.myState.name + " Information")}/>})}
                            >Information</button>
                        </div>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className="Main-button" style={{width:"100%"}} 
                                onClick={()=>Main.instance.setState({currentMenu : <AlibiMenu/>})}
                            >Alibi</button>
                        </div>
                    </div>
                    <br/>
                    <button className="Main-button" 
                    onClick={()=>Main.instance.setState({currentMenu : <GraveyardMenu/>})}>Graveyard</button>
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