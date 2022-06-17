import React from "react";
import { GameManager } from "../game/GameManager";
import { Main } from "../Main";
import { MainMenu } from "./MainMenu";

export class ChatMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chat: props.chat,
            enteredMessage : "",
            completeState : GameManager.instance.completeState,
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({
                completeState : s,
                chat: GameManager.instance.getChatFromTitle(this.state.chat.title)
            });
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    renderMessage(m){
        let s = {};
        if(m.senderName === GameManager.instance.completeState.myState.name) s = {color: "rgb(220, 220, 220)"};
        
        return(<div key={m.senderName+m.time}>
            <div className="Main-body" style={s}>
                {m.senderName+": "+m.text}
            </div>
        </div>);
    }
    renderMessages(m){
        return m.map((m) => {
            return this.renderMessage(m);
        });
    }
    render(){return(
        <div className = "Main">
            <div className="Main-body">
                <button className="Main-button" onClick={() => Main.instance.setState({currentMenu : <MainMenu/>})}>Back</button>    
            </div>
            <div className = "Main-header">
                {this.state.chat.title}
            </div>
            <br/>
            <div className="Main-body">
                
                <div>
                    {this.renderMessages(this.state.chat.chatMessages)}
                </div>
                <div>
                    <input className="Main-lineTextInput" onChange={(e)=>{
                        this.setState({enteredMessage : e.target.value});
                    }}/>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className="Main-button" style={{width:"100%"}} onClick={() => GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, false)}>Send Text</button>
                        </div>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className="Main-button" style={{width:"100%"}} onClick={() => GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, true)}>Send Will</button>
                        </div>
                    </div>
                </div>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>);
    }
}