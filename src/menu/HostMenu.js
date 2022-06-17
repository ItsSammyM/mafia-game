import React from "react";
import { GameManager } from "../game/GameManager";

export class HostMenu extends React.Component{
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
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                {this.state.completeState.myState.name}<br/>
                {this.state.completeState.myState.roomCode}
            </div>
            <div className = "Main-body">
                <br/>
                Players: 
                {this.state.completeState.gameState.players.map((p)=>{
                    return (<div key={p.name}><button className="Main-button"
                        onClick={() => {
                            let i = GameManager.instance.completeState.gameState.players.indexOf(p);
                            if(i !== -1){
                                GameManager.instance.sendKickPlayer(GameManager.instance.completeState.gameState.players[i].name);
                                GameManager.instance.completeState.gameState.players.splice(i, 1);
                                GameManager.instance.invokeStateUpdate();
                            } 
                            }}>
                        {p.name}
                    </button><br/></div>)
                })}

                <br/>
                <button className="Main-button" onClick={() => {
                    GameManager.instance.startGame();
                }}>Start Game</button>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}