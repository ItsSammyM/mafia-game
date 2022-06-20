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
        if(this.isInViewport(500))
            this.scrollToBottom();
    }
    isInViewport(offset = 0) {
        if (!this.messagesEnd) return false;
        const top = this.messagesEnd.getBoundingClientRect().top;
        return (top + offset) >= 0 && (top - offset) <= window.innerHeight;
    }
    renderMessage(m){
        let s = {};
        if(m.senderName === GameManager.instance.completeState.myState.name) {
            s = {
                color: "rgb(220, 220, 220)",
                border: "5px solid black",
                backgroundColor: "#165e28",
                maxWidth: "100vw"
            }
        }else{
            s = {
                color: "rgb(140, 140, 140)",
                border: "5px solid black",
                backgroundColor: "#1a356b",
                maxWidth: "100vw"
            }
        }
        if(m.will!==""){
            return(<div key={m.senderName+m.time} style={s}>
                <pre className="Main-body" style={{color: "#b0b004", overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                    {"Final Will of <"+m.senderName+">"}
                    <br/>
                    <br/>
                    {m.will}
                </pre>
            </div>);
        }
        if(m.text!=="")
            return(<div key={m.senderName+m.time} style={s}>
                <pre className="Main-body" style={{color: s.color, overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                    {m.senderName+": "+m.text}
                </pre>
            </div>);
    }
    renderMessages(m){
        return m.map((m) => {
            return this.renderMessage(m);
        });
    }
    sendText(will=""){
        if(will==="" && this.state.enteredMessage==="") return;
        GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, will); 
        if(will==="") this.setState({enteredMessage : ""});
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
                <div style={{position: "fixed", bottom: 10, width: "100%"}}>
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
                                this.sendText(GameManager.instance.getPlayerFromName(this.state.completeState.myState.name).will);
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
            <br ref={(el) => { this.messagesEnd = el; }}/>
            <br/>
            <br/>
            <br/>
            <div/>
        </div>);
    }
}