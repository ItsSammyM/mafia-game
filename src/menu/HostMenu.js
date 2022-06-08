import React from "react";
import { GameManager } from "../game/GameManager";

export class HostMenu extends React.Component{
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
                <div style={
                    {
                        color: "white",
                        fontWeight: 1000,
                        WebkitTextStroke: "2px rgb(0, 0, 0)"
                    }
                }>
                    {this.state.completeState.myState.roomCode}
                </div>
                <br/>
                <button className="Main-button" onClick={() => {}
                }>Start Game</button>
            </div>
        </div>
    );}
}