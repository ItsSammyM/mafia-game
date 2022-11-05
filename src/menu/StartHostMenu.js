import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import "../styles/Main.css"

export class StartHostMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode : props.roomCode,
            players : {},
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
            {((players)=>{
                let out = [];
                for(let playerName in players){
                    out.push(<div key={playerName}>{playerName}</div>);
                }
                return out;
            })(this.state.players)}
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
            {(()=>{
                if(Object.keys(this.state.players).length>0) 
                    return <div><Button text="Start" onClick={()=>{GameManager.host.startGame()}}/><br/></div>})()}
        </div>
    </div>);}
}