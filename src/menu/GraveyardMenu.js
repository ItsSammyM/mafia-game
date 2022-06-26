import { GameManager } from "../game/GameManager";
import React from "react";
import { MainMenu } from "./MainMenu";
import { Main } from "../Main";
import { GraveMenu } from "./GraveMenu"

export class GraveyardMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {
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
    renderRows(){
        let output = [];
        for(let i = 0; i < this.state.completeState.gameState.players.length || i < this.state.completeState.gameState.roleList.length; i++){
            output.push(this.renderRow(i));
        }
        return output;
    }
    renderRow(i){
        let player = this.state.completeState.gameState.players[i];
        let role = this.state.completeState.gameState.roleList[i];
        
        return(
        <div key={i} className="Main-body" style={{display: "inline-block", width:"90.7%"}}>
            {this.renderPlayer(player)}
            {this.renderRole(role)}
        </div>
    );}
    renderPlayer(player){
        if(player === undefined || player.role.alive) return (<button className="Main-button" style={{display: "inline-block", width:"50%"}}>{}</button>); 
        return(<button className="Main-button" style={{display: "inline-block", width:"50%"}}
        onClick={()=>{
            Main.instance.setState({currentMenu: <GraveMenu playerName={player.name}/>})
        }}>{player.name}</button>);
    }
    renderRole(role){
        let color = "#000000"
        if(role.faction === "Mafia") color = "#8f0b0b";
        else if(role.faction === "Town") color = "#08cc36";
        else if(role.faction === "Neutral") color = "#1412a3";

        if(role === undefined) return(<button className="Main-button" style={{color: color, display: "inline-block", width:"50%"}}>Random Random</button>);
        return(<button className="Main-button" style={{color: color, display: "inline-block", width:"50%"}}>{this.genericRoleToString(role)}</button>);
    }
    genericRoleToString(r){
        let out = "";
        out+=r.faction;
        out+=" ";
        out+=r.alignment;
        return out;
    }
    render(){return(<div className="Main">
        <div className = "Main-header">
            Graveyard
        </div>
        <br/>
        <button className="Main-button" onClick={() => {Main.instance.setState({currentMenu : <MainMenu/>})}}>Back</button>
        <br/>
        <br/>
        {this.renderRows()}
    </div>);}
}