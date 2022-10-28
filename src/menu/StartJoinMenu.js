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
            roomCodeInput:"Room Code",
            playerName : props.playerName
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    joinButton(){
        if(!this.state.roomCodeInput)
            return;
        GameManager.client.create(this.state.roomCodeInput, this.state.playerName);    
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            {this.state.playerName}<br/>
            {this.state.roomCodeInput}{(()=>{if(this.state.roomCodeInput) return(<br/>);})()}
            <TextInput onEnter={()=>{this.joinButton()}} onChange={(e)=>{this.setState({roomCodeInput:e.target.value.toLowerCase()})}}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{
                this.joinButton();
            }}/><br/>
        </div>
    </div>);}
}