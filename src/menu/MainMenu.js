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
            players: [],
            header : "Mafia",
            availableButtons : {},

            startPhaseListener : {
                listener : (c)=>{
                    console.log("ratoo");
                    this.setState({
                        header : GameManager.client.phase,
                        availableButtons : GameManager.client.availableButtons,
                    });
                }
            }
        };
    }
    componentDidMount() {
        this.setState({
            players : GameManager.client.players,
            header : GameManager.client.phase,
            availableButtons : GameManager.client.availableButtons,
        });
        GameManager.HOST_TO_CLIENT["START_PHASE"].addReceiveListener(this.state.startPhaseListener);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["START_PHASE"].removeReceiveListener(this.state.startPhaseListener);
    }
    renderPlayers(){
        return(<div>
            {this.state.players.map((e)=>{return (<div key={e.name}>
                {e.name}<br/>
                {(()=>{
                    if(e.name in this.state.availableButtons && this.state.availableButtons[e.name].includes("Target"))
                    return (<div><Button text="Target"/><br/></div>)
                })()}
            </div>)}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            {this.state.header}<br/>
        </div><br/>
        <div className="Main-body">
            <Button text="Infomation" onClick={()=>{Main.instance.changeMenu(<InformationMenu/>)}}/><br/>
            <br/>
            {this.renderPlayers()}<br/>
        </div>
    </div>);}
}