import React from "react";
import { GameManager } from "../game/GameManager";

export class ChatMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chatTitle : props.title,
            chat: null,
            enteredMessage : "",
            completeState : GameManager.instance.completeState,
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({completeState : s});
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    componentDidUpdate(prevProps, prevState) {
        this.getChatFromTitle();
    }
    getChatFromTitle(){
        for(let i = 0; i < this.state.completeState.gameState.chats.length; i++)
        {
            if(this.state.completeState.gameState.chats[i].title === this.state.chatTitle){
                this.setState({chat : this.state.completeState.gameState.chats[i]});
                return;
            }
        }
    }
    renderMessage(m){
        return(<div>
            <div className="Main-button">
                {m.senderName+m.text}
            </div>
        </div>);
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {this.state.chatName}
            </div>
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
                        this.setState({enteredMessage : e.target.value});
                    }}/>
                    <div style={{display: "inline-block", width:"90.7%"}}>
                        <div style={{display: "inline-block", width:"50%"}}><button className="Main-button" style={{width:"100%"}}>Send Text</button></div>
                        <div style={{display: "inline-block", width:"50%"}}><button className="Main-button" style={{width:"100%"}}>Send Will</button></div>
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