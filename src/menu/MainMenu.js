import { GameManager } from "../game/GameManager";
import { ChatMenu } from "./ChatMenu";
import { Main } from "../Main";
import React from "react";
import { WillMenu } from "./WillMenu";

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
        return (
            <div key={player.name} style={{display: "inline-block", width:"90.7%"}}>
                <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>{player.name}</button></div>
                <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Vote</button></div>
                <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Target</button></div>
            </div>
        );
    }
    render(){return(
        <div className = "Main">
            
            <div className = "Main-body">
                <br/>
                
                <div className = "Main-header">
                    Main
                </div>
                <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Self</button></div>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}} onClick={()=>Main.instance.setState({currentMenu : <WillMenu/>})}>Will</button></div>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Target</button></div>
                </div>
                <br/>
                <button className="Main-button">Anouncements</button>
                <br/>
                <br/>

                <div className = "Main-header">
                    Chats
                </div>
                <button className="Main-button" onClick={() => Main.instance.setState({currentMenu: <ChatMenu chat={GameManager.instance.getChatFromTitle("Day")}/>})}>Day</button>
                <br/>
                <button className="Main-button" onClick={() => Main.instance.setState({currentMenu: <ChatMenu chat={GameManager.instance.getChatFromTitle("Mafia")}/>})}>Mafia</button>
                <br/>
                <button className="Main-button" onClick={() => Main.instance.setState({currentMenu: <ChatMenu chat={GameManager.instance.getChatFromTitle("Dead")}/>})}>Dead</button>
                <br/>
                <br/>

                <div className = "Main-header">
                    Players
                </div>
                {this.state.completeState.gameState.players.map((p) => this.renderPlayer(p))}
                <br/>

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