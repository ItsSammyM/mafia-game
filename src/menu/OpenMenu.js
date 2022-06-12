import React from "react";
import { GameManager } from "../game/GameManager";
import { PlayerState } from "../game/PlayerState";
import { Main } from "../Main";
import { HostMenu } from "./HostMenu";
import { JoinMenu } from "./JoinMenu";

export class OpenMenu extends React.Component
{
    constructor(props){
        super(props);
        
        this.state = {
            enteredName : ""
        }; 
    }
    render(){
        return(
            <div className = "Main">
                <div className = "Main-header">
                    <br/>
                    Mafia
                </div>
                <div className="Main-body">
                    Name: {this.state.enteredName}
                    <br/>
                    <input className="Main-lineTextInput" onChange={(e)=>{
                        this.setState({enteredName : e.target.value});
                    }} />
                    <br/>
                    <br/>
                    <button className="Main-button" onClick={() => {
                        GameManager.instance.completeState.myState.name = this.state.enteredName;
                        GameManager.instance.completeState.gameState.phase = "waitStart";
                        GameManager.instance.completeState.myState.host = true;
                        GameManager.instance.completeState.gameState.roomCode = GameManager.generateRandomString(5);
                        GameManager.instance.completeState.myState.roomCode = GameManager.instance.completeState.gameState.roomCode;
                        GameManager.instance.pubNub.subscribe(GameManager.instance.completeState.myState.roomCode);

                        GameManager.instance.completeState.gameState.players.push(new PlayerState(this.state.enteredName));
                        
                        Main.instance.setState({currentMenu: <HostMenu/>});
                        GameManager.instance.invokeStateUpdate();
                    }}>Host New Game</button>
                    
                    <br/><br/>
                    <button className="Main-button" onClick={() => {
                        GameManager.instance.completeState.myState.name = this.state.enteredName;
                        Main.instance.setState({currentMenu: <JoinMenu/>});
                        GameManager.instance.invokeStateUpdate();
                    }}>Join Game</button>
                    
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        );
    }
}