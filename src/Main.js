import React from "react";
import { OpenMenu } from "./menu/OpenMenu";
import { GameManager } from "./game/GameManager";
import "./styles/Main.css"

export class Main extends React.Component {
    constructor(props) {
        super(props);
        Main.instance = this;

        this.state = {
            currentMenu: <OpenMenu />,
            completeState: GameManager.instance.completeState,
        };
        this.stateListener = {stateUpdate: (s) => {
            this.setState({ completeState: s });
        }};
    }
    componentDidMount() {
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount() {
        GameManager.instance.removeListener(this.stateListener);
    }
    static instance = null;
    render() {return (
        <div className="Main">
            <div className="Main-body" style={{fontSize: "calc(10px + 2vmin)", fontWeight: 550}}>
                Name: {this.state.completeState.myState.name} <br/>
                Room Code: {this.state.completeState.gameState.roomCode} <br/>
                Host: {this.state.completeState.myState.host.toString()}
            </div>
            <div>
                {this.state.currentMenu}
            </div>
        </div>
    );}
}