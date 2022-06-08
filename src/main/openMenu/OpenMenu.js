import { LineTextInput, TextInput } from "../TextInput";
import Button  from "../Button";
import React from "react";
import GameManager from "../../game/GameManager.";
import Main from "../Main";
import { Player } from "../../game/Player";

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
                        Main.instance.setState({currentMenu: <HostMenu/>})
                        GameManager.instance.startHost();
                    }}/>
                    
                    <br/><br/>
                    <Button text="Join Game" onClick={() => {
                        GameManager.instance.name = this.state.enteredName;
                        Main.instance.setState({currentMenu: <JoinMenu/>})
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
                    () => {GameManager.instance.joinGame()}
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
                    () => {}
                }/>
            </div>
        </div>
    );
}
export class WaitGameStartMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            gameState : GameManager.instance.gameState
        };
    }
    componentDidMount(){
        this.gameManagerListener = {
            stateUpdate : (e) => {this.setState({gameState: e})}
        };
        GameManager.instance.addListener(this.gameManagerListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.gameManagerListener);
    }
    renderPlayer(player){return(
        <div className = "Main-header" key={player.name}>
            {player.name}
        </div>
    );}
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Mafia
            </div>
            <div className="Main-body">
                Name: {this.state.gameState.name}
                <br/>
                Room Code : {this.state.gameState.roomCode}
                <br/>
                <br/>
                Players
                <br/>
                <br/>
                {this.state.gameState.players.map((p)=>{
                    return this.renderPlayer(p)
                })}
            </div>
        </div>
    );}
}