import React from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import "../styles/Main.css"

export class StartHostMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode : props.roomCode,
            players : [],
        };
    }
    componentDidMount() {
        if(GameManager.host.isHost)
            GameManager.CLIENT_TO_HOST["ASK_JOIN"].receiveListeners.push((c)=>{
                this.setState({players: GameManager.host.players});
            });
    }
    componentWillUnmount() {
    }
    renderPlayers(){
        return(<div>
            {this.state.players.map((e)=>{return e.name}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            {this.state.roomCode}<br/>
            {this.renderPlayers()}<br/>
            <Button text="Start" onClick={()=>{}}/><br/>
        </div>
    </div>);}
}