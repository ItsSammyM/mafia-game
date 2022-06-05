import { LineTextInput, TextInput } from "../TextInput";
import Button  from "../Button";
import React from "react";
import GameManager from "../../game/GameManager.";

export class OpenMenu extends React.Component
{
    constructor(props){
        super(props);
        
        this.state = {
            enteredName : ""
        };
    }
    render()
    {
        return(
            <div className = "Main">
                <div className = "Main-header">
                    <br/>
                    Mafia
                </div>
                <div className="Main-body">
                    Name: {this.state.enteredName}
                    <br/>
                    <LineTextInput onChange={(e)=>{
                        this.setState({enteredName : e});
                    }} />
                    <br/>
                    <br/>
                    <Button text="Host New Game" onClick={() => {
                        GameManager.instance.name = this.state.enteredName;
                        this.props.onHost();
                    }}/>
                    
                    <br/><br/>
                    <Button text="Join Game" onClick={() => {
                        GameManager.instance.name = this.state.enteredName;
                        this.props.onJoin();
                    }}/>
                </div>
            </div>
        );
    }
}
export function JoinMenu(props){
    return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {GameManager.instance.name}
            </div>
            <div className = "Main-body">
                <br/>
                Room Code
                <br/>
                <LineTextInput onChange={(e)=>GameManager.instance.roomCode = e}/>
                <br/><br/>
                <Button text="Join Game" onClick={
                    () => props.onStart()
                }/>
            </div>
        </div>
    );
}
export function HostMenu(props){
    return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                {GameManager.instance.name}
            </div>
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
                    () => props.onStart()
                }/>
            </div>
        </div>
    );
}