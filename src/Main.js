import React from "react";
import { StartMenu } from "./menu/StartMenu.js"
import "./styles/Main.css"

export class Main extends React.Component {
    static instance = null;
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
    render() {return (<div className="body">
        <br/>
        {this.state.currentMenu}
    </div>);}

    changeMenu(menu){
        this.setState({currentMenu:menu});
    }
}