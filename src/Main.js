import React from "react";
import { StartMenu } from "./menu/StartMenu.js"
import "./styles/Main.css"

export class Main extends React.Component {
    constructor(props) {
        super(props);
        Main.instance = this;

        this.state = {
            currentMenu: <StartMenu />,
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    static instance = null;
    render() {return (<div className="Main">
            {this.state.currentMenu}
    </div>);}
}