import React from "react";
import { Button } from "../menuComponents/Button";
import { InformationMenu } from "./InformationMenu";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import "../styles/Main.css"

export class MainMenu extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            players: [],
            header : "Mafia",
            availableButtons : {},

            START_PHASE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        header : GameManager.client.phase,
                        availableButtons : GameManager.client.availableButtons,
                    });
                }
            }
        };
    }
    componentDidMount() {
        this.setState({
            players : GameManager.client.players,
            header : GameManager.client.phase, 
        });
        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.START_PHASE_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.START_PHASE_LISTENER);
    }
    renderPlayers(){

        let out = []
        for(let playerName in this.state.players){
            out.push(<div key={playerName}>
                {playerName}<br/>

                {(()=>{
                    if(this.state.players[playerName].availableButtons.whisper)
                        return (<div><Button text="Whisper" onClick={() => {GameManager.client.clickWhisper(playerName)}}/><br/></div>);
                })()}

                {(()=>{
                    if(this.state.players[playerName].availableButtons.target)
                        return (<div><Button text="Target" onClick={() => {GameManager.client.clickTarget(playerName)}}/><br/></div>);
                })()}

                {(()=>{
                    if(this.state.players[playerName].availableButtons.vote)
                        return (<div><Button text="Vote" onClick={()=>{GameManager.client.clickVote(playerName)}}/><br/></div>);
                })()}

            </div>)
        }

        return(out);
    }
    render() {return (<div>
        <div className="Main-header">
            {this.state.header}<br/>
        </div><br/>
        <div className="Main-body">
            {GameManager.client.playerName}<br/>
            <Button text="Infomation" onClick={()=>{Main.instance.changeMenu(<InformationMenu/>)}}/><br/>
            <br/>
            <br/>
            {this.renderPlayers()}<br/>
        </div>
    </div>);}
}