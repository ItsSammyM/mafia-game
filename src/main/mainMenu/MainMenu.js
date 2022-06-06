import React from "react";
import GameManager from "../../game/GameManager.";
import Button  from "../Button";

export class MainMenu extends React.Component
{
    constructor(props){
        super(props);
    }
    renderPlayer(player){
        return (
            <div key={player.name} style={{display: "inline-block", width:"90.7%"}}>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text={player.name}/></div>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Vote"/></div>
                <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Target"/></div>
            </div>
        );
    }
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Main
            </div>
            <div className = "Main-body">
                {"Room Code: "+GameManager.instance.roomCode}
                <br/>
                <br/>
                <div style={{display: "inline-block", width:"90.7%"}}>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Self"/></div>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Will"/></div>
                    <div style={{display: "inline-block", width:"33%"}}><Button style={{width:"100%"}} text="Target"/></div>
                </div>
                <br/>
                <Button text="Announcements"/>
                <br/>

                <br/>
                <Button text="Day" exclamation={true}/>
                <br/>
                <Button text="Mafia"/>
                <br/>
                <Button text="Dead"/>
                <br/>


                <br/>
                {GameManager.instance.gameState.players.map((p) => this.renderPlayer(p))}
                <br/>

                <br/>
                <Button text="Wiki"/>
                <br/>
            </div>
        </div>
    );}
}