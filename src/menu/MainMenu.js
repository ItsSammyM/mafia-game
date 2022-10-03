import React from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import "../styles/Main.css"

export class MainMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            players: []
        };
    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    renderPlayers(){
        return(<div>
            {this.state.players.map((e)=>{return (<div>
                {e.name}<br/>
            </div>)}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia<br/>
        </div><br/>
        <div className="Main-body">
            {this.renderPlayers()}
        </div>
    </div>);}
}