import React from "react";
import { GameManager } from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { Main } from "../Main";

export class WillMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            enteredWill : GameManager.instance.getPlayerFromName(GameManager.instance.completeState.myState.name).will,
        };
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                Will
            </div>
            <div className = "Main-body">
                <textarea className="Main-lineTextInput" value={this.state.enteredWill}
                    style={{minHeight: "70vh"}}
                    onChange={(e)=>{
                        this.setState({enteredWill : e.target.value});
                    }}/>
                <button className="Main-button" onClick={() => {
                    GameManager.instance.sendSaveWill(GameManager.instance.completeState.myState.name, this.state.enteredWill);
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