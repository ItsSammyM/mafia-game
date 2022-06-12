import React from "react";
import { GameManager } from "../game/GameManager";

export class ChatMenu extends React.Component{
    constructor(){
        this.state = {
            chatTitle : "",
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
    renderMessage(m){

    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {this.state.chatName}
            </div>
            <div className="Main-body">
                <div>
                    {}
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