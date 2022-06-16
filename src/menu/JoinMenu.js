import React from "react";
import { GameManager } from "../game/GameManager";

export class JoinMenu extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            enteredRoomCode : "",
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
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {this.state.completeState.myState.name}
            </div>
            <div className = "Main-body">
                <br/>
                Room Code: {this.state.enteredRoomCode}
                <br/>
                <input className="Main-lineTextInput" onChange={(e)=>{
                    this.setState({enteredRoomCode : e.target.value});
                }}/>
                <br/><br/>
                <button className="Main-button" onClick={() => {
                    GameManager.instance.completeState.myState.roomCode = this.state.enteredRoomCode;
                    GameManager.instance.pubNub.subscribe(GameManager.instance.completeState.myState.roomCode);
                    GameManager.instance.sendJoinRequest();
                    GameManager.instance.invokeStateUpdate();
                }}>Join Game</button>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}