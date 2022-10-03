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
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    renderPlayers(){
        return(<div>
            {GameManager.host.players.map((e)=>{return e.name}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            {this.state.roomCode}<br/>
            <Button text="Start" onClick={()=>{}}/><br/>
        </div>
    </div>);}
}