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
    sendText(text, type="msg"){
        if(text==="") return;
        GameManager.instance.sendChatMessage(text, this.state.chat.title, type); 
        if(type==="msg") this.setState({enteredMessage : ""});
    }

    renderMessage(m){
        let divStyle = {
            border: "5px solid black",
            maxWidth: "100vw"
        };

        if(m.senderName === GameManager.instance.completeState.myState.name) {
            divStyle.color = "rgb(220, 220, 220)";
            divStyle.backgroundColor = "#165e28";
        }else{
            divStyle.color = "rgb(140, 140, 140)";
            divStyle.backgroundColor = "#1a356b";
        }

        switch(m.type){
            case "alibi":
                {
                    return(<div key={m.senderName+m.time+m.type+m.text+Math.random()} style={divStyle}>
                        <pre className="Main-body" style={{color: "#b0b004", overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                            {"Alibi of <"+m.senderName+">"}
                            <br/>
                            <br/>
                            {m.text}
                        </pre>
                    </div>);
                }
            case "msg":
                {
                    return(<div key={m.senderName+m.time+m.type+m.text+Math.random()} style={divStyle}>
                        <pre className="Main-body" style={{color: divStyle.color, overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                            {m.senderName+": "+m.text}
                        </pre>
                    </div>);
                }
            case "private information":
                {
                    divStyle.backgroundColor = "#751717";
                    divStyle.color = "rgb(220, 220, 220)";
                    return(<div key={m.senderName+m.time+m.type+m.text+Math.random()} style={divStyle}>
                        <pre className="Main-body" style={{color: divStyle.color, overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                            {m.text}
                        </pre>
                    </div>);
                }
            case "public information":
                {
                    divStyle.backgroundColor = "#7a6916";
                    divStyle.color = "rgb(220, 220, 220)";
                    return(<div key={m.senderName+m.time+m.type+m.text+Math.random()} style={divStyle}>
                        <pre className="Main-body" style={{color: divStyle.color, overflow:"auto", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>
                            {m.text}
                        </pre>
                    </div>);
                }
            default:
                {

                }
        }
    }
    renderMessages(m){
        return m.map((m) => {
            return this.renderMessage(m);
        });
    }
    renderSendComponent(){


        //Notify when restricted

        return(
            <div style={{position: "fixed", bottom: 10, width: "100%"}}>
                <div className="Main-header" style={{color:"#aa0000"}}>{
                    this.state.chat.restrictedPlayerNames.includes(this.state.completeState.myState.name) ? "Restricted" : ""
                }</div>
                <input className="Main-lineTextInput" value={this.state.enteredMessage}
                    onKeyPress={(e) => {
                        if(e.code === "Enter") {
                            this.sendText(this.state.enteredMessage);
                        }
                    }}
                    onChange={(e)=>{
                        this.setState({enteredMessage : e.target.value});
                }}/>
                <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}>
                        <button className="Main-button" style={{width:"100%"}} 
                        onClick={() => {
                            Main.instance.setState({currentMenu : <MainMenu/>});
                            let index = GameManager.instance.completeState.myState.unreadChats.indexOf(this.state.chat.title);
                            if(index !== -1) GameManager.instance.completeState.myState.unreadChats.splice(index ,1);
                        }}
                        >Back</button> 
                    </div>
                    <div style={{display: "inline-block", width:"33%"}}>
                        <button className="Main-button" style={{width:"100%"}} 
                        onClick={() => {
                            this.sendText(GameManager.instance.getPlayerFromName(this.state.completeState.myState.name).alibi, "alibi");
                        }}>Send Alibi</button>
                    </div>
                    <div style={{display: "inline-block", width:"33%"}}>
                        <button className="Main-button" style={{width:"100%"}}
                        onClick={() => {
                            this.sendText(this.state.enteredMessage);
                        }}>Send Text</button>
                    </div>
                </div>
            </div>
        );
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
                {this.renderSendComponent()}
            </div>
            <br ref={(el) => { this.messagesEnd = el; }}/>
            <br/>
            <br/>
            <br/>
            <div/>
        </div>);
    }
}