import React from "react";
import GameManager from "../game/GameManager";
import { Button } from "../menuComponents/Button";
import { GraveyardMenu } from "./GraveyardMenu";
import { MainMenu } from "./MainMenu";

export class GraveMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            playerName : props.playerName,
            grave : GameManager.client.graves[props.playerName],

            SEND_GRAVES_LISTENER : {
                listener : (c)=>{
                    this.setState({grave : GameManager.client.graves[this.state.playerName]});
                }
            }
        }
    }
    componentDidMount() {
        this.setState({
            grave : GameManager.client.graves[this.state.playerName],
        });
        GameManager.HOST_TO_CLIENT["SEND_GRAVES"].addReceiveListener(this.state.SEND_GRAVES_LISTENER);
    }
    componentWillUnmount() {
        GameManager.HOST_TO_CLIENT["SEND_GRAVES"].removeReceiveListener(this.state.SEND_GRAVES_LISTENER);
    }
    render() {return(<div className="Main">
        <div className="Main-header">
            Graveyard<br/>
        </div><br/>
        <div className="Main-body">
            <Button text="Back" onClick={()=>{
                MainMenu.instance.setRightPanel(<GraveyardMenu/>);
            }}/><br/>
            <br/>
            <Button>
                {this.state.grave.playerName}<br/>
                {this.state.grave.roleName}<br/>
                <br/>
                Died on {this.state.grave.phaseDied} {this.state.grave.cycleDied}<br/>
                <br/>
                {this.state.grave.will}<br/>
            </Button>
        </div>
    </div>);}
}