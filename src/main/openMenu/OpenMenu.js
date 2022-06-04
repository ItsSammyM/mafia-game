import { LineTextInput, TextInput } from "../TextInput";
import Button  from "../Button";
import { render } from "@testing-library/react";
import React from "react";
import GameManager from "../../GameManager.";
import Main from "../Main";

export class OpenMenu extends React.Component
{
    constructor(props){
        super(props);
        
        
        this.state = {
            subMenu : this.renderOpen(),
            enteredName : ""
        };
    }
    renderOpen(){
        return(
            <p className = "Main-body">
                <br/>
                <Button text="Host New Game" onClick={() => {
                    GameManager.instance.startHost();
                    this.setState({subMenu: this.renderHost()});
                }}/>
                
                <br/><br/>
                <Button text="Join Game" onClick={() => {
                    this.setState({subMenu: this.renderJoin()});
                }}/>
            </p>
        );
    }
    renderHost(){
        return(
            <div className = "Main-body">
                
                <br/>
                Room Code
                <br/>
                <div style={
                    {
                        color: "white",
                        fontWeight: 1000,
                        WebkitTextStroke: "2px rgb(0, 0, 0)"
                    }
                }>
                    {GameManager.instance.roomCode}
                </div>
                <br/>
                <Button text="Start Game" onClick={
                    this.props.onHostStart()
                }/>
            </div>
        );
    }
    renderJoin(){
        return(
            <div className = "Main-body">
                <br/>
                Room Code
                <br/>
                <LineTextInput/>
            </div>
        );
    }
    render()
    {
        return(
            <div className = "Main">
                <p className = "Main-header">
                    <br/>
                    Mafia
                </p>
                <div className="Main-body">
                    Name: {this.state.enteredName}
                    <br/>
                    <LineTextInput onChange={(e)=>{
                        this.setState({enteredName : e});
                    }} />
                    <br/>
                </div>
                {this.state.subMenu}
            </div>
        );
    }
}