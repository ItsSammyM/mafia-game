import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import { ChatMenu } from "./ChatMenu";
import "../styles/Main.css"
import { mergeSort } from "../game/functions";

export class MainMenu extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            roomCode: "",
            roleName: "",

            players: {},
            header : "Mafia",
            phaseName : "",

            targetedPlayerNames : [],
            votedForName : null,
            judgementStatus : 0,
            playerOnTrialName : null,

            START_PHASE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        header : GameManager.client.phaseName + " " + GameManager.client.cycleNumber,
                        players : GameManager.client.players,
                        phaseName : GameManager.client.phaseName,

                        targetedPlayerNames : [],
                        votedForName : null,
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
                        votedForName : GameManager.client.cycle.votedForName,
                    });
                }
            },
            BUTTON_JUDEMENT_RESPONSE_LISTENER : {
                listener : (c)=>{
                    console.log("HI3")
                    this.setState({
                        judgementStatus : GameManager.client.cycle.judgementStatus,
                    });
                }
            },
            PLAYER_ON_TRIAL_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        playerOnTrialName : GameManager.client.cycle.playerOnTrialName,
                    });
                }
            },
            UPDATE_PLAYERS_LISTENERS : {
                listener : (c)=>{
                    this.setState({
                        players : GameManager.client.players,
                    });
                }
            }
        };
    }
    componentDidMount() {
        this.setState({
            header : GameManager.client.phaseName + " " + GameManager.client.cycleNumber,
            players : GameManager.client.players,
            phaseName : GameManager.client.phaseName,

            roomCode : GameManager.client.roomCode,
            roleName: GameManager.client.roleName,

            targetedPlayerNames : GameManager.client.cycle.targetedPlayerNames,
            votingPlayerName : GameManager.client.cycle.votedForName,

            judgementStatus : GameManager.client.cycle.judgementStatus,

            playerOnTrialName : GameManager.client.cycle.playerOnTrialName,
        });
        this.state.START_PHASE_LISTENER.listener(null);

        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
    
        GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].addReceiveListener(this.state.BUTTON_JUDEMENT_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].addReceiveListener(this.state.PLAYER_ON_TRIAL_LISTENER);
        GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].addReceiveListener(this.state.UPDATE_PLAYERS_LISTENERS);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
    
        GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].removeReceiveListener(this.state.BUTTON_JUDEMENT_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].removeReceiveListener(this.state.PLAYER_ON_TRIAL_LISTENER);
        GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].removeReceiveListener(this.state.UPDATE_PLAYERS_LISTENERS);
    }
    renderPlayers() {
        let out = [];

        for(let playerName in this.state.players){
            let player = this.state.players[playerName];
            out.push([player,
                (<div key={playerName} className="Main-box">
                    {playerName}<br/>
                    {player.suffixes.map((s,i)=>(<div key={i}>({s})</div>))}<br/>
                    {(()=>{
                        if(player.availableButtons.whisper)
                            return (<div><Button text="Whisper" onClick={() => {GameManager.client.clickWhisper(playerName)}}/><br/></div>);
                    })()}

                    {(()=>{
                        if(player.availableButtons.target)
                            return (<div><Button text="Target" onClick={() => {GameManager.client.clickTarget(playerName)}}/><br/></div>);
                    })()}

                    {(()=>{
                        if(player.availableButtons.vote)
                            return (<div><Button text="Vote" onClick={()=>{GameManager.client.clickVote(playerName)}}/><br/></div>);
                    })()}

                </div>)]
            );
        }
        out = mergeSort(out, (a,b)=>{
            if(a[0].name === GameManager.client.playerName) return 1000;
            if(b[0].name === GameManager.client.playerName) return -1000;

            if(a[0].alive === b[0].alive) return 0;
            if(a[0].alive) return 10;
            return -10;
        });
        out = out.map( a => a[1]);
        
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
                    
                    {(()=>{if(this.state.votedForName != null) return <div>
                        
                        My Vote: {this.state.votedForName}<br/>
                        <Button text="Clear Vote" onClick={()=>{GameManager.client.clickClearVote()}}/><br/>
                    </div>})()} 
                    
                    
                </div>);
            case "Testimony":
                return(<div>
                    Trial<br/>
                    {"<<"+this.state.playerOnTrialName+">>"}<br/>
                </div>);
            case "Judgement":
                return(<div>
                    Trial<br/>
                    {"<<"+this.state.playerOnTrialName+">>"}<br/>
                    {(()=>{if(this.state.playerOnTrialName !== GameManager.client.playerName) return <div>
                        My Vote: {(()=>{
                            if(this.state.judgementStatus === -1){
                                return "Guilty";
                            }else if(this.state.judgementStatus === 1){
                                return "Innocent";
                            }else{
                                return "Abstain";
                            }

                        })()}<br/>
                        <Button text="Innocent" onClick={()=>{GameManager.client.clickJudgement(1)}}/><br/>
                        <Button text="Guilty" onClick={()=>{GameManager.client.clickJudgement(-1)}}/><br/>
                    </div>})()}
                </div>);
            default:
                return;
        }
    }
    render(){return(

        <div className={"splitScreen"}>
          <div className={"leftPane"}>{<div><ChatMenu chatState={GameManager.client.informationChat}/></div>}</div>
          <div className={"rightPane"}>{this.renderMain()}</div>
        </div>)
        
    }
    renderMain() {return (<div>
        <div className="Main-body">
            Room Code: {this.state.roomCode}
        </div>
        
        <div className="Main-header">
            {this.state.header}<br/>
        </div><br/>

        <div className="Main-body">
            {GameManager.client.playerName} the {this.state.roleName}<br/>
            <Button text="Information" onClick={()=>{Main.instance.changeMenu(<ChatMenu chatState={GameManager.client.informationChat}/>)}} color={GameManager.client.informationChat.notification ? GameManager.COLOR.IMPORTANT : null}/><br/>
            <br/>
            {this.renderPhase(this.state.phaseName)}
            <br/>
            {this.renderPlayers()}<br/>
        </div>
    </div>);}
}