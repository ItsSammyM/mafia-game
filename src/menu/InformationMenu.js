import React from "react";
import { Button } from "../components/Button";
// import { TextInput } from "../components/TextInput";
import GameManager from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { Main } from "../Main";
import "../styles/Main.css"

export class InformationMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: []
        };
    }
    componentDidMount() {
        this.setState({messages : GameManager.client.information})
    }
    componentWillUnmount() {

    }
    renderMessages(){
        //this.color = color;
        return(<div>
            {this.state.messages.map((e, i)=>{return (<div key={i} className="Main-box">
                {e.title+" "+e.text}
            </div>)}, this)}
        </div>);
    }
    render() {return (<div>
        <div className="Main-header">
            Information<br/>
        </div><br/>
        <div className="Main-body">
            <Button text="Back" onClick={()=>{Main.instance.changeMenu(<MainMenu/>)}}/>
            {this.renderMessages()}
        </div>
    </div>);}
}