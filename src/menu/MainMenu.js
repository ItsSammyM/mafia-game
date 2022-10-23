import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import { ChatMenu } from "./ChatMenu";
import "../styles/Main.css"

export class MainMenu extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            players: {},
            header : "Mafia",
            phaseName : "",

            targetedPlayerNames : [],
            votedForName : "",

            START_PHASE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        header : GameManager.client.phaseName + " " + GameManager.client.cycleNumber,
                        players : GameManager.client.players,
                        phaseName : GameManager.client.phaseName
                    });
                }
            },
            BUTTON_TARGET_RESPONSE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        targetedPlayerNames : GameManager.client.cycle.targetedPlayerNames,
                    });
                }
            },
            BUTTON_VOTE_RESPONSE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        votingPlayerName : GameManager.client.cycle.votedForName,
                    });
                }
            }
        };
    }
    componentDidMount() {
        this.setState({
            players : GameManager.client.players,
        });
        this.state.START_PHASE_LISTENER.listener(null);

        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
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
    renderPhase(phaseName){
        switch(phaseName){
            case "Night":
                return(<div>
                    
                    {(()=>{if(this.state.targetedPlayerNames.length > 0) return <div>
                        
                        My Targets: <br/>
                        {this.state.targetedPlayerNames.map((p, i)=><div key={i}>{p}</div>)}<br/>
                        <Button text="Clear Targets" onClick={()=>{GameManager.client.clickClearTarget()}}/><br/>
                    </div>})()} 
                    
                </div>);
            case "Voting":
                return(<div>
                    
                    My Vote: {this.state.votingPlayerName}<br/>
                    <Button text="Clear Vote" onClick={()=>{GameManager.client.clickClearVote()}}/><br/>
                    
                </div>);
            default:
                return;
        }
    }
    render() {return (<div>
        <div className="Main-header">
            {this.state.header}<br/>
        </div><br/>

        <div className="Main-body">
            {GameManager.client.playerName}<br/>
            <Button text="Infomation" onClick={()=>{Main.instance.changeMenu(<ChatMenu chatState={GameManager.client.informationChat}/>)}} color={GameManager.client.informationChat.notification ? GameManager.COLOR.IMPORTANT : null}/><br/>
            <br/>
            {this.renderPhase(this.state.phaseName)}
            <br/>
            {this.renderPlayers()}<br/>
        </div>
    </div>);}
}