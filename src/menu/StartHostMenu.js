import React from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import "../styles/Main.css"

export class StartHostMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
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
            <Button text="Start" onClick={()=>{}}/><br/>
        </div>
    </div>);}
}