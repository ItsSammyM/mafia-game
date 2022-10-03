import React from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import { StartHostMenu } from "./StartHostMenu";
import { StartJoinMenu } from "./StartJoinMenu";
import { Main } from "../Main";
import "../styles/Main.css"

export class StartMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nameInput : ""
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    joinButton(){
        if(!this.state.nameInput)
            return;
        Main.instance.changeMenu(<StartJoinMenu playerName={this.state.nameInput}/>);
    }
    hostButton(){
        if(!this.state.nameInput)
            return;
        GameManager.host.create();
        GameManager.client.create(GameManager.host.roomCode, this.state.nameInput);
        Main.instance.changeMenu(<StartHostMenu roomCode={GameManager.host.roomCode}/>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        
        <div className="Main-body">
            {this.state.nameInput}{(()=>{if(this.state.nameInput) return(<br/>);})()}
            Name<br/>
            <TextInput onEnter={()=>{this.joinButton()}} onChange={(e) => this.setState({nameInput: e.target.value})}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{
                this.joinButton();
            }}/><br/>
            <Button text="Host" onClick={()=>{
                this.hostButton()
            }}/><br/>
        </div>
    </div>);}
}