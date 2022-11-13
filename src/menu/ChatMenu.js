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

            sendBarHeader : "All",
            UPDATE_LISTENER : {
                listener : () => {
                    this.setState({
                        chatMessageList : GameManager.client.chatMessageList,
                    });
                }
            },
            UPDATE_CLIENT_LISTENER : {
                listener : (c)=>{
                    let out = "";
                    for(let i = 0; i < GameManager.client.chatGroupSendList.length; i++){
                        out+=GameManager.client.chatGroupSendList[i]+", ";
                    }

                    if(out.length>=2)
                        out = out.substring(0,out.length-2);
                    if(out.length===0)
                        out = "NO CHATS AVAILABLE"
                    
                    this.setState({
                        sendBarHeader : out
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
        GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].addReceiveListener(this.state.UPDATE_CLIENT_LISTENER);
        this.scrollToBottom();
    }
    componentWillUnmount() {
        GameManager.client.removeMessageListener(this.state.UPDATE_LISTENER);
        GameManager.HOST_TO_CLIENT["UPDATE_CLIENT"].removeReceiveListener(this.state.UPDATE_CLIENT_LISTENER);
    }
    componentDidUpdate() {
        if(this.bottomIsInViewport(500))   //used to be 500
            this.scrollToBottom();
    }

    scrollToBottom() {
        this.buttomOfPage.scrollIntoView({ behavior: "smooth" });
    }
    bottomIsInViewport(offset = 0) {
        if (!this.buttomOfPage) return false;
        const top = this.buttomOfPage.getBoundingClientRect().top;
        //if top is between 0 and height then true
        //else false
        return (top + offset) >= 0 && (top - offset) <= window.innerHeight;
    }

    sendButton(){
        if(this.state.enteredMessage===""||!this.state.enteredMessage) return;

        GameManager.client.clickSendMessage(this.state.enteredMessage);
        this.changeEnteredMessage("");
    }
    postButton(){
        if(GameManager.client.savedNotePad["Will"])
            GameManager.client.clickSendMessage(GameManager.client.savedNotePad["Will"]);
    }
    changeEnteredMessage(m){
        this.setState({enteredMessage : m});
        this.state.onChangeMessageListener(m);

        if(!m || m===""){
            setTimeout(()=>{
                //if(this.bottomIsInViewport(500))
                    this.scrollToBottom();
            },100)
        }
    }

    renderFixed(){return<div style={{position: "sticky", bottom: 10, width: "100%"}}>
        {this.state.sendBarHeader}<br/>
        <div>
            <div style={{width:"45%", display:"inline-block"}}>
                <Button text="Post" width="100%" onClick={()=>{
                    this.postButton();
                }}/>
            </div>
            <div style={{width:"45%", display:"inline-block"}}>
                <Button text="Send" width="100%" onClick={()=>{
                    this.sendButton();
                }}/>
            </div>
        </div>
        <TextInput 
            value={this.state.enteredMessage}
            onEnter={()=>{
                this.sendButton();
            }}
            onChange={(e)=>{
                this.changeEnteredMessage(e.target.value.substring(0,GameManager.MAX_MESSAGE_LENGTH));
        }}/><br/>
    </div>}
    render() {return (<div className="Main">
        {/* <div className="Main-header">
            {this.state.title}<br/>
        </div><br/> */}
        <br/>
        <br/>
        <br/>
        <br/>
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
                                    {(() => {if(e.text) return (<div>{e.text}<br/></div>)})()}
                                    
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