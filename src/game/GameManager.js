import { Main } from "../Main";
import { OpenMenu } from "../menu/OpenMenu";
import { WaitStartMenu} from "../menu/WaitStartMenu";
import { CompleteState } from "./CompleteState";
import { PlayerState } from "./PlayerState";
import { PubNubWrapper } from "./PubNubWrapper";

export class GameManager{
    constructor(){
        this.completeState = new CompleteState();
        this.listeners = [];

        this.pubNub = new PubNubWrapper();
        this.pubNub.addMsgListener((m) => this.onMessage(m));
    }
    setState(cs){
        this.completeState = cs;
        this.invokeStateUpdate();
    }
    invokeStateUpdate(){
        for(let i = 0; i < this.listeners.length; i++){
            if(this.listeners[i]) this.listeners[i].stateUpdate(this.completeState);
        }
        if(this.completeState.myState.host) this.sendGameState();
    }
    addListener(l){
        this.listeners.push(l);
    }
    removeListener(l){
        for(let i = 0; i < this.listeners.length; i++){
            if(this.listeners[i] == l){
                this.listeners.splice(i);
                return;
            }
        }
    }
    
    sendGameState(){
        this.pubNub.createAndPublish(this.completeState.myState.roomCode, "gameState", {
            gameState: this.completeState.gameState
        });
    }

    onMessage(m){
        console.log("Recieved");
        console.log(m.message);

        switch(m.message.type){
            case "test":
                break;
            case "joinRequest":
                if(!this.completeState.myState.host) break;
                if(this.completeState.gameState.phase != "waitStart") break;
                this.completeState.gameState.players.push(new PlayerState(m.message.contents.name));
                this.invokeStateUpdate();
                this.pubNub.createAndPublish(this.completeState.gameState.roomCode, "joinResponse", {
                    success: true,
                    detail : "No Implemented Exeptions"
                });
                break;
            case "joinResponse":
                if(this.completeState.myState.host) break;
                if(m.message.contents.success){
                    Main.instance.setState({currentMenu : <WaitStartMenu/>});
                }else{
                    alert(m.message.contents.detail);
                    Main.instance.setState({currentMenu : <OpenMenu/>});
                }
                break;
            case "gameState":
                if(this.completeState.myState.host) break;
                this.completeState.gameState = m.message.contents.gameState;
                this.invokeStateUpdate();
                break;
            case "kickPlayer":
                if(this.completeState.myState.host) break;
                Main.instance.setState({currentMenu : <OpenMenu/>});
                break;
        };
    }
    
    static instance = new GameManager();
    static generateRandomString(length){
        let allChars = "abcdefghijklmnopqrstuvwxyz1234567890";
        let out = "";

        for(let i = 0; i < length; i++)
        {
            let r = Math.random()*allChars.length;
            out+=allChars.substring(r, r+1);
        }
        return out;
    }
}

/*
pubNubMessage(m){
        console.log("Recieved");
        console.log(m.message);

        switch(m.message.type){
            case "test":
                break;
            case "joinRequest":
                if(!this.host){
                    break;
                }
                this.gameState.players.push(new Player(m.message.contents.name));
                this.pubNubPublish(this.pubNubCreatePayLoad(this.roomCode, "joinResponse",
                    {
                        name: m.message.contents.name,
                        success: true,
                        text: "No Implemented Exeptions"
                    }
                ));
                this.sendGameState();
                break;
            case "joinResponse":
                if(m.message.contents.name != this.name){
                    break;
                }
                if(!m.message.contents.success){
                    alert("Join Failed: "+m.message.contents.text);
                    break;
                }
                if(!this.host){
                    Main.instance.setState({
                        currentMenu: <WaitGameStartMenu/>
                    });
                }

                break;
            case "gameState":
                if(this.host) break;
                this.setState(m.message.contents.state);
                break;
        };
    }
*/
/*
import React from "react";
import GameManager from "../../game/GameManager.";
import Button  from "../Button";

export class MainMenu extends React.Component
{
    constructor(props){
        super(props);
    }
    renderPlayer(player){
        return (
            <div key={player.name} style={{display: "inline-block", width:"90.7%"}}>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text={player.name}/></div>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Vote"/></div>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Target"/></div>
            </div>
        );
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Main
            </div>
            <div className = "Main-body">
                {"Room Code: "+GameManager.instance.roomCode}
                <br/>
                <br/>
                <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Self"/></div>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Will"/></div>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Target"/></div>
                </div>
                <br/>
                <Button text="Announcements"/>
                <br/>

                <br/>
                <Button text="Day" exclamation={true}/>
                <br/>
                <Button text="Mafia"/>
                <br/>
                <Button text="Dead"/>
                <br/>


                <br/>
                {GameManager.instance.gameState.players.map((p) => this.renderPlayer(p))}
                <br/>

                <br/>
                <Button text="Wiki"/>
                <br/>
            </div>
        </div>
    );}
}
*/