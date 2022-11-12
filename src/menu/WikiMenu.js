import React from "react";
import { Button } from "../menuComponents/Button";
import "../styles/Main.css"
import GameManager from "../game/GameManager";
import { MainMenu } from "./MainMenu";
import { PlayerListMenu } from "./PlayerlistMenu";
import { RoleWikiMenu } from "./RoleWikiMenu";

export class WikiMenu extends React.Component {

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
                        MainMenu.instance.setRightPanel(<RoleWikiMenu faction={r[0]} alignment={r[1]} exactRole={r[2]}/>);
                    }}/><br/>
                </div> );
            }
        );
    }
    renderInvestigatorResults(){
        let out = [];
        for(let i in GameManager.client.investigativeResults){
            out.push(this.renderSingleInvestigatorResult(i));
        }
        return out;
    }
    renderSingleInvestigatorResult(i){
        let numbRoles = GameManager.client.investigativeResults[i].length;

        if(numbRoles === 0) return;

        let out = [];
        for(let j in GameManager.client.investigativeResults[i]){
            let roleName = GameManager.client.investigativeResults[i][j];

            out.push(<div key={j} style={{width:`${90/(numbRoles)}%`, display:"inline-block"}}>
                <Button key={roleName} text={roleName}
                    onClick={()=>{
                        MainMenu.instance.setRightPanel(<RoleWikiMenu faction={null} alignment={null} exactRole={roleName}/>);
                }}/>
            </div>);
        }
        return(<div key={i}>{out}<br/></div>);
    }
    render() {return (<div className="Main">
        <div className="Main-header">
            Roles<br/>
        </div>
        
        <div className="Main-body">
            <Button text="Back" onClick={()=>{
                MainMenu.instance.setRightPanel(<PlayerListMenu/>);
            }}/><br/>
            <br/>
            Role List
            {this.renderRoleList()}
            <br/>
            Investigative Results
            {this.renderInvestigatorResults()}

        </div>
    </div>);}
}