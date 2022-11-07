import React from "react";
import "../styles/Main.css"

export class WaitJoinMenu extends React.Component {
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
            Waiting for host to start the game
        </div>
    </div>);}
}