import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import "../styles/Main.css"

export class StartHostMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode : props.roomCode,
            players : [],
        };
        this.updatePlayers = {
            listener : (contents)=>{
                this.setState({players: GameManager.host.players});
            }
        };
    }
    componentDidMount() {
        if(GameManager.host.isHost)
            GameManager.CLIENT_TO_HOST["ASK_JOIN"].addReceiveListener(this.updatePlayers);
    }
    componentWillUnmount() {
        GameManager.CLIENT_TO_HOST["ASK_JOIN"].removeReceiveListener(this.updatePlayers);
    }
    renderPlayers(){
        return(<div>
            {this.state.players.map((e)=>{return (<div key={e.name}>{e.name}<br/></div>)}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            Room Code:<br/>
            {this.state.roomCode}<br/>
            <br/>
            {this.renderPlayers()}<br/>
            <Button text="Start" onClick={()=>{GameManager.host.start()}}/><br/>
        </div>
    </div>);}
}