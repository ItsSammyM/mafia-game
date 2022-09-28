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
    render() {return (<div>
        <div className="Main-header">
            Mafia
        </div><br/>
        
        <div className="Main-body">
            {this.state.nameInput}{(()=>{if(this.state.nameInput) return(<br/>);})()}
            Name<br/>
            <TextInput onChange={(e) => this.setState({nameInput: e.target.value})}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{
                if(!this.state.nameInput)
                    return;
                Main.instance.changeMenu(<StartJoinMenu/>);
            }}/><br/>
            <Button text="Host" onClick={()=>{
                if(!this.state.nameInput)
                    return;
                Main.instance.changeMenu(<StartHostMenu/>)
                GameManager.createClient(GameManager.createHost());
            }}/><br/>
        </div>
    </div>);}
}