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
        this.setState({messages : GameManager.client.information});
        this.scrollToBottom();
    }
    componentWillUnmount() {

    }
    componentDidUpdate() {
        //if(this.bottomIsInViewport(500))
            this.scrollToBottom();
    }
    scrollToBottom() {
        this.buttomOfPage.scrollIntoView({ behavior: "smooth" });
    }
    bottomIsInViewport(offset = 0) {
        if (!this.buttomOfPage) return false;
        const top = this.buttomOfPage.getBoundingClientRect().top;
        return (top + offset) >= 0 && (top - offset) <= window.innerHeight;
    }
    renderFixed(){return<div style={{position: "fixed", bottom: 10, width: "100%"}}>
        <Button text="Back" onClick={()=>{Main.instance.changeMenu(<MainMenu/>)}}/><br/>
    </div>}
    render() {return (<div>
        <div className="Main-header">
            Information<br/>
        </div><br/>

        <div className="Main-body">
            
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
                                    {(() => {if(e.title) return (<div>{"<"+e.title+">"}<br/></div>)})()}
                                    {e.text}<br/>
                                </div>
                            )})()}
                        />
                    )}
                )
            }
            {this.renderFixed()}
            
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br ref={(el) => { this.buttomOfPage = el; }}/>
    </div>);}
}