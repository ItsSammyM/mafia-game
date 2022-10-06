import React from "react";
import { Button } from "../menuComponents/Button";
//import { TextInput } from "../components/TextInput";
import { InformationMenu } from "./InformationMenu";
import GameManager from "../game/GameManager";
import { Main } from "../Main";
import "../styles/Main.css"

export class MainMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            players: []
        };
    }
    componentDidMount() {
        this.setState({players : GameManager.client.players})
    }
    componentWillUnmount() {

    }
    renderPlayers(){
        return(<div>
            {this.state.players.map((e)=>{return (<div key={e.name}>
                {e.name}<br/>
                <Button text="Target"/><br/>
            </div>)}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Mafia<br/>
        </div><br/>
        <div className="Main-body">
            <Button text="Infomation" onClick={()=>{Main.instance.changeMenu(<InformationMenu/>)}}/>
            {this.renderPlayers()}
        </div>
    </div>);}
}