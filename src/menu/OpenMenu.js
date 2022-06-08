import React from "react";
import { GameManager } from "../game/GameManager";
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
                        this.setState({enteredName : e});
                    }} />
                    <br/>
                    <br/>
                    <button className="Main-button" onClick={() => {
                        GameManager.instance.completeState.myState.name = this.state.enteredName;
                        GameManager.instance.invokeStateUpdate();
                        Main.instance.setState({currentMenu: <HostMenu/>});

                        // GameManager.instance.startHost();
                    }}>Host New Game</button>
                    
                    <br/><br/>
                    <button className="Main-button" onClick={() => {
                        GameManager.instance.completeState.myState.name = this.state.enteredName;
                        GameManager.instance.invokeStateUpdate();
                        Main.instance.setState({currentMenu: <JoinMenu/>});
                    }}>Join Game</button>
                </div>
            </div>
        );
    }
}