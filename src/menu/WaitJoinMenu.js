import React from "react";
import GameManager from "../game/GameManager";
import { Button } from "../menuComponents/Button";
import "../styles/Main.css"

export class WaitJoinMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playerNames:[],
            PLAYER_NAME_LIST_LISTENER: {
                listener: (c)=>{
                    
                    this.setState({
                        playerNames : c.allPlayerNames,
                    });
                }
            }
        };
    }
    componentDidMount() {
        GameManager.HOST_TO_CLIENT["PLAYER_NAME_LIST"].addReceiveListener(this.state.PLAYER_NAME_LIST_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["PLAYER_NAME_LIST"].removeReceiveListener(this.state.PLAYER_NAME_LIST_LISTENER);
    }
    render() {return (<div>
        <br/>
        <br/>
        <br/>
        <br/>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            Waiting for host to start the game...<br/>
            <br/>
            You entered the name:<br/>
            {GameManager.client.playerName}<br/>
            <br/>
            You entered the room code:<br/>
            {GameManager.client.roomCode}<br/>
            <br/>
            <br/>
            {
                this.state.playerNames.map((p)=><Button key={p}>{p}</Button>)
            }
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
    </div>);}
}