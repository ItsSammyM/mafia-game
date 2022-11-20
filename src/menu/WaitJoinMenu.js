import React from "react";
import GameManager from "../game/GameManager";
import "../styles/Main.css"

export class WaitJoinMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
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
        </div>
    </div>);}
}