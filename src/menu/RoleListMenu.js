import React from "react";
import { Button } from "../menuComponents/Button";
import "../styles/Main.css"
import GameManager from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { PlayerListMenu } from "./PlayerlistMenu";
import { WikiMenu } from "./WikiMenu";

export class RoleListMenu extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            
        };
    }
    componentDidMount() {
        
    }
    componentWillUnmount() {
        
    }
    componentDidUpdate() {
        
    }
    renderRoleList(){
        return GameManager.client.roleList.map(
            (r, i)=>{
                let outString = ((r[0]?r[0]:"")+" "+(r[1]?r[1]:"")+" "+(r[2]?r[2]:"")).trim();
                if(!outString||outString==="") outString="Any";
                return(<div key={i}>
                    <Button text={outString} onClick={()=>{
                        MainMenu.instance.setRightPanel(<WikiMenu faction={r[0]} alignment={r[1]} exactRole={r[2]}/>);
                    }}/><br/>
                </div> );
            }
        );
    }
    render() {return (<div>
        <div className="Main-header">
            Role List<br/>
        </div>
        
        <div className="Main-body">
            <Button text="Back" onClick={()=>{
                MainMenu.instance.setRightPanel(<PlayerListMenu/>);
            }}/><br/>
            <br/>
            {this.renderRoleList()}
        </div>
    </div>);}
}