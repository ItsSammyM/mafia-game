import React from "react";
import { Button } from "../Components/Button";
import { TextInput } from "../Components/TextInput";
import "../styles/Main.css"

export class StartMenu extends React.Component {
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
            Main
        </div><br/>
        
        <div className="Main-body">
            Name<br/>
            <TextInput onChange={(e) => console.log(e.target.value)}/><br/>
            <br/>
            <Button text="Join" onClick={()=>{console.log("no")}}/><br/>
            <Button text="Host"/><br/>
        </div>
    </div>);}
}