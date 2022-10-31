import React from "react";
import { Button } from "../menuComponents/Button";
import "../styles/Main.css"
import GameManager from "../game/GameManager";
import { TextInput } from "../menuComponents/TextInput";

export class ChatMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            chatMessageList : GameManager.client.chatMessageList,

            enteredMessage : "",
            onChangeMessageListener : props.onChangeMessageListener,

            UPDATE_LISTENER : {
                listener : () => {
                    this.setState({
                        chatMessageList : GameManager.client.chatMessageList,
                    });
                }
            }
        };
    }
    componentDidMount() {
        this.setState({
            chatMessageList : GameManager.client.chatMessageList,
        });
        GameManager.client.addMessageListener(this.state.UPDATE_LISTENER);
        this.scrollToBottom();
    }
    componentWillUnmount() {
        GameManager.client.removeMessageListener(this.state.UPDATE_LISTENER);
    }
    componentDidUpdate() {
        if(this.bottomIsInViewport(3000))   //used to be 500
            this.scrollToBottom();
    }
    scrollToBottom() {
        this.buttomOfPage.scrollIntoView({ behavior: "smooth" });
    }
    bottomIsInViewport(offset = 0) {
        if (!this.buttomOfPage) return false;
        const top = this.buttomOfPage.getBoundingClientRect().top;
        return (top + offset) >= 0 && (top - offset) <= window.innerHeight;
    }
    renderFixed(){return<div style={{position: "sticky", bottom: 10, width: "100%"}}>
        <Button text="Send" onClick={()=>{
            console.log(this.state.enteredMessage)
        }}/><br/>
        <Button text="Send-Alibi" onClick={()=>{
        }}/><br/>
        <TextInput onChange={(e)=>{
            this.setState({enteredMessage : e.target.value});
            this.state.onChangeMessageListener(e.target.value)
        }}/><br/>
    </div>}
    render() {return (<div>
        {/* <div className="Main-header">
            {this.state.title}<br/>
        </div><br/> */}

        <div className="Main-body">
            {
                this.state.chatMessageList.map(
                    (e, i)=>{return (
                        <Button
                            key={i} 
                            className="Main-box" 
                            color = {e.color}
                            text={(()=>{return(
                                <div>
                                    {(() => {if(e.title) return (<div>{"<"+e.title+">"}<br/></div>)})()}
                                    {e.text}<br/>
                                </div>
                            )})()}
                        />
                    )}
                )
            }
            
            <br/>
            <br ref={(el) => { this.buttomOfPage = el; }}/>
            {this.renderFixed()}
        </div>
    </div>);}
}