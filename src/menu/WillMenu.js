import React from "react";
import { GameManager } from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { Main } from "../Main";

export class WillMenu extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            completeState : GameManager.instance.completeState,
            enteredWill : ""
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({completeState : s});
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">

            </div>
            <div className = "Main-body">
                <input className="Main-lineTextInput" value={this.state.enteredMessage}
                    onChange={(e)=>{
                        this.setState({enteredWill : e.target.value});
                    }}/>
                <button className="Main-button" onClick={() => {
                    //make it so you can save the will and send it to host
                    Main.instance.setState({currentMenu: <MainMenu/>});
                }}>Back</button>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </div>
    );}
}