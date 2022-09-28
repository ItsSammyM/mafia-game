import React from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import {WaitJoinMenu} from "./WaitJoinMenu"
import "../styles/Main.css"

export class StartJoinMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCodeInput:""
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            {this.state.roomCodeInput}{(()=>{if(this.state.roomCodeInput) return(<br/>);})()}
            Room Code<br/>
            <TextInput onChange={(e)=>{this.setState({roomCodeInput:e.target.value.toLowerCase()})}}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{
                if(!this.state.roomCodeInput)
                    return;
                GameManager.createClient(this.state.roomCodeInput);
                //Main.instance.changeMenu(<WaitJoinMenu/>)
            }}/><br/>
        </div>
    </div>);}
}