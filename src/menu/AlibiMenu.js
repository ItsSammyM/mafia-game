import React from "react";
import { GameManager } from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { Main } from "../Main";

export class AlibiMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            enteredAlibi : GameManager.instance.getPlayerFromName(GameManager.instance.completeState.myState.name).alibi,
        };
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                Alibi
            </div>
            <div className = "Main-body">
                <textarea className="Main-lineTextInput" value={this.state.enteredAlibi}
                    style={{minHeight: "70vh"}}
                    onChange={(e)=>{
                        this.setState({enteredAlibi : e.target.value});
                    }}/>
                <button className="Main-button" onClick={() => {
                    GameManager.instance.sendSaveAlibi(GameManager.instance.completeState.myState.name, this.state.enteredAlibi);
                    Main.instance.setState({currentMenu: <MainMenu/>});
                }}>Back</button>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}