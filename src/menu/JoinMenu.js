import React from "react"
import { GameManager } from "../game/GameManager";

export class JoinMenu extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {completeState : GameManager.instance.completeState};
        this.stateListener = (s) => {
            this.setState({completeState : s})
        };
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
            Room Code
            <br/>
            <input className="Main-lineTextInput" onChange={(e)=>{
                GameManager.instance.state.myState.roomCode = e;
                GameManager.instance.invokeStateUpdate();
            }}/>
            <br/><br/>
            <button className="Main-button" onClick={() => {
                //GameManager.instance.joinGame()
            }}>Join Game</button>
        </div>
    </div>
    );}
}