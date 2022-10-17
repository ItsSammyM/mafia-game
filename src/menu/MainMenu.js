import React from "react";
import { Button } from "../menuComponents/Button";
//import { TextInput } from "../components/TextInput";
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

            startPhaseListener : {
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
            availableButtons : GameManager.client.availableButtons,
        });
        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.startPhaseListener);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.startPhaseListener);
    }
    renderPlayers(){

        let out = []
        for(let playerName in GameManager.client.players){
            out.push(<div key={playerName}>
                {playerName}<br/>

                {(()=>{
                    if(playerName in this.state.availableButtons && this.state.availableButtons[playerName].includes("Whisper"))
                        return (<div><Button text="Whisper" onClick={() => {GameManager.client.clickWhisper(playerName)}}/><br/></div>);
                })()}

                {(()=>{
                    if(playerName in this.state.availableButtons && this.state.availableButtons[playerName].includes("Target"))
                        return (<div><Button text="Target" onClick={() => {GameManager.client.clickTarget(playerName)}}/><br/></div>);
                })()}

                {(()=>{
                    if(playerName in this.state.availableButtons && this.state.availableButtons[playerName].includes("Vote"))
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
            {this.renderPlayers()}<br/>
        </div>
    </div>);}
}