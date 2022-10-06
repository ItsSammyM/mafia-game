import React from "react";
import { Button } from "../menuComponents/Button";
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
        //messages[i].title
        //messages[i].text
        //messages[i].color
    }
    render() {return (<div>
        <div className="Main-header">
            Information<br/>
        </div><br/>

        <div className="Main-body">
            <Button text="Back" onClick={()=>{Main.instance.changeMenu(<MainMenu/>)}}/><br/>
            <br/>
            {
                this.state.messages.map(
                    (e, i)=>{return (
                        <Button 
                            key={i} 
                            className="Main-box" 
                            color = {e.color}
                            text={(()=>{return(
                                <div>
                                    {"<"+e.title+">"}<br/>
                                    {e.text}<br/>
                                </div>
                            )})()}
                        />
                    )}
                )
            }
        </div>
    </div>);}
}