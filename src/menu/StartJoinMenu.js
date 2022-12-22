import React from "react";
import { Button } from "../menuComponents/Button";
import { TextInput } from "../menuComponents/TextInput";
import GameManager from "../game/GameManager";
import "../styles/Main.css"

/**
 * props.playerName
 * 
 */
export class StartJoinMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCodeInput:"",
            playerName : props.playerName,
            connectionStatus : "",
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    joinButton(){
        if(!this.state.roomCodeInput)
            return;
        this.setState({connectionStatus : "Attempting to connect to a host with this roomcode. If you see this screen, you should probably try the room code again, or refresh the page."});
        GameManager.client.create(this.state.roomCodeInput, this.state.playerName);    
    }
    render() {return (<div>
        <br/>
        <br/>
        <br/>
        <br/>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            {this.state.playerName}<br/>
            {this.state.roomCodeInput?(<div>{this.state.roomCodeInput}<br/></div>):""}
            {this.state.connectionStatus?(<div>{this.state.connectionStatus}<br/></div>):""}
            Room Code<br/>
            <TextInput onEnter={()=>{this.joinButton()}} onChange={(e)=>{this.setState({roomCodeInput:e.target.value.toLowerCase()})}}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{
                this.joinButton();
            }}/><br/>

        </div>
        <br/>
        <br/>
        <br/>
        <br/>
    </div>);}
}