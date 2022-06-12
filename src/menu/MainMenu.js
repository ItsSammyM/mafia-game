import { GameManager } from "../game/GameManager";
import React from "react";

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
            <div className = "Main-header">
                <br/>
                Main
            </div>
            <div className = "Main-body">
                {"Room Code: "+this.state.completeState.gameState.roomCode}
                <br/>
                <br/>
                <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Self</button></div>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Will</button></div>
                    <div style={{display: "inline-block", width:"33%"}}><button className="Main-button" style={{width:"100%"}}>Target</button></div>
                </div>
                <br/>
                <button className="Main-button">Anouncements</button>
                <br/>

                <br/>
                <button className="Main-button">Day</button>
                <br/>
                <button className="Main-button">Mafia</button>
                <br/>
                <button className="Main-button">Dead</button>
                <br/>


                <br/>
                {this.state.completeState.gameState.players.map((p) => this.renderPlayer(p))}
                <br/>

                <br/>
                <button className="Main-button">Wiki</button>
                
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}