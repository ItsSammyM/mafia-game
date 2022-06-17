import React from "react";
import { GameManager } from "../game/GameManager";

export class WaitStartMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {completeState : GameManager.instance.completeState};
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
    renderPlayer(player){return(
        <div className = "Main-header" key={player.name}>
            {player.name}
        </div>
    );}
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Mafia
            </div>
            <div className="Main-body">
                <br/>
                Players
                <br/>
                {this.state.completeState.gameState.players.map((p)=>{
                    return (<div className = "Main-header" key={p.name}>
                        {p.name}
                    </div>);
                })}
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}