import React from "react";
import { Button } from "../menuComponents/Button";
import "../styles/Main.css"
import { ROLES } from "../game/ROLES";
import { MainMenu } from "./MainMenu";
import { RoleListMenu } from "./RoleListMenu";

export class WikiMenu extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            faction : props.faction,
            alignment : props.alignment,
            exactRole : props.exactRole,
        };
    }
    componentDidMount() {
        
    }
    componentWillUnmount() {
        
    }
    componentDidUpdate() {
        
    }
    renderSingleRole(roleConst){return(<div className="Main-box" key={roleConst.name}>
        {roleConst.name+roleConst.emoji}<br/>
        {roleConst.faction+" "+roleConst.alignment}<br/>
        <br/>
        {roleConst.basicDescription}<br/>
        <br/>
        Defense: {roleConst.defense}<br/>
        RoleBlockable: {roleConst.roleblockable?"true":"false"}<br/>
        Witchable: {roleConst.witchable?"true":"false"}<br/>
        Interogation Results: {roleConst.isSuspicious?"Suspicious":"Innocent"}<br/>
        <br/>
        
    </div>);}
    renderRoleList(){
        let out = [];
        for(let roleName in ROLES){
            let roleConst = ROLES[roleName];

            //if its not supposed to be shown
            if(!(
                (this.state.faction===null || roleConst.faction===this.state.faction) && 
                (this.state.alignment===null || roleConst.alignment===this.state.alignment) && 
                (this.state.exactRole===null || roleConst.name===this.state.exactRole) &&
                (roleConst.maximumCount>0)
            ))continue;

            out.push(
                this.renderSingleRole(roleConst)
            );
        }
        return out;
    }
    render() {return (<div>
        <div className="Main-header">
            Roles Wiki<br/>
        </div>
        
        <div className="Main-body">
            <Button text="Back" onClick={()=>{
                MainMenu.instance.setRightPanel(<RoleListMenu/>);
            }}/><br/>
            <br/>
            {this.renderRoleList()}
        </div>
    </div>);}
}