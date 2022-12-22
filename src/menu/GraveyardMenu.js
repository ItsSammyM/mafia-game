import React from "react";
import GameManager from "../game/GameManager";
import { Button } from "../menuComponents/Button";
import { GraveMenu } from "./GraveMenu";
import { MainMenu } from "./MainMenu";
import { PlayerListMenu } from "./PlayerlistMenu";

export class GraveyardMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            graves : [],

            SEND_GRAVES_LISTENER : {
                listener : (c)=>{
                    this.setState({graves : GameManager.client.graves});
                }
            }
        }
    }
    componentDidMount() {
        this.setState({
            graves : GameManager.client.graves,
        });
        GameManager.HOST_TO_CLIENT["SEND_GRAVES"].addReceiveListener(this.state.SEND_GRAVES_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["SEND_GRAVES"].removeReceiveListener(this.state.SEND_GRAVES_LISTENER);
    }
    renderGraves() {
        let out = [];
        for(let playerName in this.state.graves){
            let grave = this.state.graves[playerName];
            out.push(<Button key={playerName} onClick={()=>{
                MainMenu.instance.setRightPanel(<GraveMenu playerName={playerName}/>);
            }}>
                {grave.playerName + " : " + grave.roleName}<br/>
            </Button>);
        }
        return out;
    }
    render() {return(<div className="Main">
        <br/>
        <br/>
        <br/>
        <br/>
        <div className="Main-header">
            Graveyard<br/>
        </div><br/>
        <div className="Main-body">
            <Button text="Back" onClick={()=>{
                MainMenu.instance.setRightPanel(<PlayerListMenu/>);
            }}/><br/>
            <br/>
            {this.renderGraves()}<br/>
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
    </div>);}
}