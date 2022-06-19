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
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
        this.scrollToBottom();
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    componentDidUpdate() {
        this.scrollToBottom();
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
    sendText(will=false){
        GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, will); 
        this.setState({enteredMessage : ""});
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                {this.state.chat.title}
            </div>
            <br/>
            <div className="Main-body">
                
                <div>
                    {this.renderMessages(this.state.chat.chatMessages)}
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <div style={{position: "fixed", bottom: 10, width: "100%"}} onSubmit={() => console.log(6)}>
                    <input className="Main-lineTextInput" value={this.state.enteredMessage}
                        onKeyPress={(e) => {
                            if(e.code === "Enter") {
                                this.sendText();
                            }
                        }}
                        onChange={(e)=>{
                            this.setState({enteredMessage : e.target.value});
                        }}/>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}>
                            <button className="Main-button" style={{width:"100%"}} 
                            onClick={() => Main.instance.setState({currentMenu : <MainMenu/>})}
                            >Back</button> 
                        </div>
                        <div style={{display: "inline-block", width:"33%"}}>
                            <button className="Main-button" style={{width:"100%"}} 
                            onClick={() => {
                                this.sendText(true);
                            }}>Send Will</button>
                        </div>
                        <div style={{display: "inline-block", width:"33%"}}>
                            <button className="Main-button" style={{width:"100%"}} 
                            onClick={() => {
                                this.sendText();
                            }}>Send Text</button>
                        </div>
                    </div>
                </div>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            <div ref={(el) => { this.messagesEnd = el; }}/>
        </div>);
    }
}