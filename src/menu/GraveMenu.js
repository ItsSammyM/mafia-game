import React from "react";
import { GameManager } from "../game/GameManager";
import { Main } from "../Main";
import { GraveyardMenu } from "./GraveyardMenu";

export class GraveMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            playerName : props.playerName,
            completeState : GameManager.instance.completeState
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
    render(){
        let player = GameManager.instance.getPlayerFromName(this.state.playerName);
        return(<div className="Main">
        <div className="Main-header">
            Grave of {this.state.playerName}
        </div>
        <div className="Main-body">
            {player.grave.phase + " " + player.grave.dayNumber} <br/><br/>
            Role:
            {player.grave.roleTitle} <br/><br/>
            Alibi <br/>
            {player.grave.alibi} <br/>
            <br/>
            <button className="Main-button" onClick={() => {Main.instance.setState({currentMenu : <GraveyardMenu/>})}}>Back</button>
        </div>
    </div>
    );}
}