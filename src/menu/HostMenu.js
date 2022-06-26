import React from "react";
import { AllRoles } from "../game/AllRoles";
import { GameManager } from "../game/GameManager";
import { Main } from "../Main";
import { OpenMenu } from "./OpenMenu";

export class HostMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            roleList : [],
            completeState : GameManager.instance.completeState
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({completeState : s});
        }};
        this.state.roleList.push({faction: "Random", alignment : "Random"});
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }

    renderRolePick(i){
        let confirmedRoleOptions = [];
        for(let r in AllRoles){
            confirmedRoleOptions.push(r);
        }

        return(
        <div key={i} style={{display: "inline-block",  width:"90.7%"}}>
            <select className="Main-button" style={{display: "inline-block", width:"50%"}} onChange={(e)=>{
                    let arr = this.state.roleList.slice();
                    arr[i].faction = e.target.value;
                    arr[i].alignment = "Random";
                    this.setState({roleList : arr});
                }}>
                <option>Random</option>
                <option>Town</option>
                <option>Mafia</option>
                <option>Neutral</option>
                {confirmedRoleOptions.map((o, i)=>{return(<option key={o}>{o}</option>);})}
            </select>
            {this.renderAlignmentPick(i)}
        </div>
    );}
    renderAlignmentPick(i){
        let alignmentOptions = []

        //if(this.state.rolePickers[i] === undefined) return;
        switch(this.state.roleList[i].faction){
            case "Town":
                alignmentOptions.push("Random");
                alignmentOptions.push("Investigative");
                alignmentOptions.push("Support");
                alignmentOptions.push("Killing");
                alignmentOptions.push("Protective");
                break;
            case "Mafia":
                alignmentOptions.push("Random");
                alignmentOptions.push("Support");
                alignmentOptions.push("Killing");
                break;
            case "Neutral":
                alignmentOptions.push("Random");
                alignmentOptions.push("Evil");
                alignmentOptions.push("Killing");
                alignmentOptions.push("Chaos");
                break;
            default:
        }

        return(
            <select className="Main-button" style={{display: "inline-block", width:"50%"}} onChange={(e)=>{
                let arr = this.state.roleList.slice();
                arr[i].alignment = e.target.value;
                this.setState({roleList : arr});
            }}>
                {Object.values(alignmentOptions).map((a, i)=>{return <option key={a}>{a}</option>})}
            </select>
        );
    }
    renderRemoveButton(){
        if(this.state.roleList.length > 1){
            return (<button className="Main-button" onClick={() => {
                let arr = this.state.roleList.slice();
                arr.pop();
                this.setState({roleList : arr});
            }}>Remove</button>);
        }                        
    }

    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                {this.state.completeState.myState.name}<br/>
                Room Code <br/>
                {this.state.completeState.myState.roomCode}
            </div>
            <div className = "Main-body">
                <br/>
                <button className="Main-button" onClick={() => {
                    GameManager.instance.startGame(this.state.roleList);
                }}>Start Game</button>
                <button className="Main-button" onClick={() => {
                    Main.instance.setState({currentMenu: <OpenMenu/>});
                    GameManager.instance.resetState();
                }}>Back</button>
                <br/>
                
                <br/>
                Players: 
                {this.state.completeState.gameState.players.map((p)=>{
                    let name = "";
                    if(p.name === this.state.completeState.myState.name)
                        name += "You: ";
                    name += p.name;

                    return (<div key={p.name}><button className="Main-button"
                        onClick={() => {
                            let i = GameManager.instance.completeState.gameState.players.indexOf(p);
                            if(i !== -1){
                                GameManager.instance.sendKickPlayer(GameManager.instance.completeState.gameState.players[i].name);
                                GameManager.instance.completeState.gameState.players.splice(i, 1);
                                GameManager.instance.invokeStateUpdate();
                            } 
                            }}>
                        {name}
                    </button><br/></div>)
                })}
                
                <br/>
                Role List
                {this.state.roleList.map(function(currentelement, index, arrayobj) {
                    return this.renderRolePick(index);
                },this)}
                <button className="Main-button" onClick={() => {
                    this.state.roleList.push({faction: "Random", alignment : "Random"});
                    this.forceUpdate();
                }}>Add</button>
                {this.renderRemoveButton()}
                
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}