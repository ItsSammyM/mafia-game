import React from "react";
import { GameManager } from "../game/GameManager";
import { ChatState } from "../game/ChatState";

export class ChatMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chatTitle : props.title,
            chat: new ChatState(),
            enteredMessage : "",
            completeState : GameManager.instance.completeState,
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({completeState : s});
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
        this.getChatFromTitle();    //i think this causes an infinite loop
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    getChatFromTitle(){
        this.setState({chat: GameManager.instance.getChatFromTitle(this.state.chatTitle)});
    }
    renderMessage(m){
        return(<div>
            <div className="Main-button">
                {m.senderName+": "+m.text}
            </div>
        </div>);
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {this.state.chat.title}
            </div>
            <br/>
            <div className="Main-body">
                <div>
                    {
                        this.state.chat.chatMessages.map((m) => {
                            return this.renderMessage(m);
                        })
                    }
                </div>
                <div>
                    <input className="Main-lineTextInput" onChange={(e)=>{
                        //this.setState({enteredMessage : e.target.value});
                        //Un codenoting this line makes it send a chat message on every single imput change.
                    }}/>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className="Main-button" style={{width:"100%"}} onClick={GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, false)}>Send Text</button>
                        </div>
                        <div style={{display: "inline-block", width:"50%"}}>
                            <button className="Main-button" style={{width:"100%"}} onClick={GameManager.instance.sendChatMessage(this.state.completeState.myState.name, this.state.enteredMessage, this.state.chat.title, true)}>Send Will</button>
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