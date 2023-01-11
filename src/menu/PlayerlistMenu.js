import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import "../styles/Main.css"
import { mergeSort } from "../game/functions";
import { WikiMenu } from "./WikiMenu"
import { MainMenu } from "./MainMenu";
import { NotePadMenu } from "./NotePadMenu";
import { GraveyardMenu } from "./GraveyardMenu";

export class PlayerListMenu extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            roomCode : "",
            roleName : "",

            players : {},
            header : "Mafia",
            phaseName : "",

            targetedPlayerNames : [],
            votedForName : null,
            judgementStatus : 0,
            playerOnTrialName : GameManager.client.cycle.playerOnTrialName,
            chatGroupSendList : [],

            timeLeft : GameManager.client.timeLeft,

            seeSelfAlive : true,

            START_PHASE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        header : GameManager.client.phaseName + " " + GameManager.client.cycleNumber,
                        players : GameManager.client.players,
                        phaseName : GameManager.client.phaseName,

                        targetedPlayerNames : GameManager.client.cycle.targetedPlayerNames,
                        votedForName : GameManager.client.cycle.votedForName,
                        judgementStatus : GameManager.client.judgementStatus,
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
            UPDATE_PLAYERS_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        players : GameManager.client.players,
                    });
                }
            },
            UPDATE_CLIENT_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        seeSelfAlive : GameManager.client.seeSelfAlive,
                        chatGroupSendList : GameManager.client.chatGroupSendList,
                    });
                }
            },
            TICK_LISTENER : {
                listener : ()=>{
                    if(GameManager.client.timeLeftMs>0)
                        this.setState({
                            timeLeft : Math.ceil(GameManager.client.timeLeftMs/1000),
                        });
                }
            },
            YOUR_ROLE_LISTENER : {
                listener : (c)=>{
                    this.setState({
                        roleName : GameManager.client.roleName,
                    });
                }
            },
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
            chatGroupSendList : GameManager.client.chatGroupSendList,

            seeSelfAlive : GameManager.client.seeSelfAlive,
            timeLeft : GameManager.client.timeLeft,
        });
        this.state.START_PHASE_LISTENER.listener(null);

        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].addReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].addReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
    
        GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].addReceiveListener(this.state.BUTTON_JUDEMENT_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].addReceiveListener(this.state.PLAYER_ON_TRIAL_LISTENER);
        GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].addReceiveListener(this.state.UPDATE_PLAYERS_LISTENER);
        
        GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].addReceiveListener(this.state.UPDATE_CLIENT_LISTENER);
        GameManager.client.addTickListener(this.state.TICK_LISTENER);

        GameManager.HOST_TO_CLIENT["YOUR_ROLE"].addReceiveListener(this.state.YOUR_ROLE_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.START_PHASE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_TARGET_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_TARGETS_RESPONSE"].removeReceiveListener(this.state.BUTTON_TARGET_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["BUTTON_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
        GameManager.HOST_TO_CLIENT["BUTTON_CLEAR_VOTE_RESPONSE"].removeReceiveListener(this.state.BUTTON_VOTE_RESPONSE_LISTENER);
    
        GameManager.HOST_TO_CLIENT["BUTTON_JUDGEMENT_RESPONSE"].removeReceiveListener(this.state.BUTTON_JUDEMENT_RESPONSE_LISTENER);

        GameManager.HOST_TO_CLIENT["PLAYER_ON_TRIAL"].removeReceiveListener(this.state.PLAYER_ON_TRIAL_LISTENER);
        GameManager.HOST_TO_CLIENT["UPDATE_PLAYERS"].removeReceiveListener(this.state.UPDATE_PLAYERS_LISTENER);

        GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].removeReceiveListener(this.state.UPDATE_CLIENT_LISTENER);
        GameManager.client.removeTickListener(this.state.TICK_LISTENER);

        GameManager.HOST_TO_CLIENT["YOUR_ROLE"].removeReceiveListener(this.state.YOUR_ROLE_LISTENER);
    }
    renderPlayers() {
        let out = [];

        for(let playerName in this.state.players){
            let player = this.state.players[playerName];

            let numButtons = player.availableButtons.whisper+player.availableButtons.target+player.availableButtons.vote+player.availableButtons.dayTarget;

            let deadSuffix = player.suffixes.includes("Died");

            out.push([player,
                (<div key={playerName} className="Main-box" style={{"backgroundColor": deadSuffix?"#aaaaaa":undefined}}>

                    {playerName}<br/>
                    {(()=>{
                        if(this.state.phaseName === "Voting" && player.votedByNum !== 0)
                            return (<div>{player.votedByNum}<br/></div>)
                    })()}
                    
                    
                    {player.suffixes.map((s,i)=>(<div key={i}>({s})</div>))}
                    <div>
                        {(()=>{
                            let color = this.state.chatGroupSendList.includes(playerName)?(GameManager.COLOR.GREYED_OUT):null
                            if(player.availableButtons.whisper)
                                return (<Button width={`${90/numButtons}%`} text="Whisper" color={color} onClick={() => {GameManager.client.clickWhisper(playerName)}}/>);
                        })()}

                        {(()=>{
                            if(player.availableButtons.target)
                                return (<Button width={`${90/numButtons}%`} text="Target" onClick={() => {GameManager.client.clickTarget(playerName)}}/>);
                        })()}

                        {(()=>{
                            if(player.availableButtons.dayTarget)
                                return (<Button width={`${90/numButtons}%`} text="Day Target" onClick={() => {GameManager.client.clickDayTarget(playerName)}}/>);
                        })()}

                        {(()=>{
                            if(player.availableButtons.vote)
                                return (<Button width={`${90/numButtons}%`} text="Vote" onClick={()=>{GameManager.client.clickVote(playerName)}}/>);
                        })()}
                    </div>

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
                    {(()=>{if(
                            this.state.playerOnTrialName !== GameManager.client.playerName && this.state.seeSelfAlive
                        ) return <div>
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
                        <Button text="Abstain" onClick={()=>{GameManager.client.clickJudgement(0)}}/><br/>
                    </div>})()}
                </div>);
            default:
                return;
        }
    }
    render(){return(<div className="Main">
            <br/>
            <br/>
            <br/>
            <br/>
            <div className="Main-body">
                Room Code: {this.state.roomCode}<br/>
                <br/>
                <Button text="Wiki" onClick={()=>MainMenu.instance.setRightPanel(<WikiMenu/>)}/><br/>
                <Button text="Graveyard" onClick={()=>MainMenu.instance.setRightPanel(<GraveyardMenu/>)}/><br/>
                <Button text="NotePad" onClick={()=>MainMenu.instance.setRightPanel(<NotePadMenu/>)}/><br/>
            </div>
            <br/>
            <div className="Main-header">
                {this.state.header}<br/>
            </div><br/>
    
            <div className="Main-body">
                {GameManager.client.playerName} : {this.state.roleName}<br/>
                
                Time Left: {this.state.timeLeft}
                <div className="Main-box">
                    {this.renderPhase(this.state.phaseName, this.state.playerOnTrial)}
                </div><br/>
                <br/>
                
                {this.renderPlayers()}<br/>
                
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>);
    }
}