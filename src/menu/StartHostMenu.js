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

            roleList : [],
        };
        this.updatePlayers = {
            listener : (contents)=>{
                this.setState({players: GameManager.host.players});

                for(let i = 0; i < Object.keys(GameManager.host.players).length; i++){
                    if(i < this.state.roleList.length) continue;
                    this.state.roleList.push([null, null, null]);
                }

                this.setState({roleList : this.state.roleList});
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
    renderPlayers(players){
        let out = [];
        for(let playerName in players){
            out.push(<div key={playerName}>{playerName}</div>);
        }
        return out;
    }
    renderRoleListPickers(roleList){
        let roleListPickers = [];

        for(let i in roleList){
            roleListPickers.push(<div key={i}>
                <Button width="30%" text="Faction"/><Button width="30%" text="Alignment"/><Button width="30%" text="Exact"/>
            </div>);
        }
        
        return(roleListPickers);
    }
    render() {return (<div className="Main">
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            Room Code:<br/>
            {this.state.roomCode}<br/>
            <br/>
            {this.renderPlayers(this.state.players)}<br/>
            {(()=>{
                if(Object.keys(this.state.players).length>0) 
                    return <div><Button text="Start" onClick={()=>{GameManager.host.startGame()}}/><br/></div>
            })()}
            <br/>
            {this.renderRoleListPickers(this.state.roleList)}<br/>
        </div>
    </div>);}
}