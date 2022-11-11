import React from "react";
import { MainMenu } from "./MainMenu";
import { PlayerListMenu } from "./PlayerlistMenu";
import { Button } from "../menuComponents/Button";
import { TextArea } from "../menuComponents/TextArea";
import GameManager from "../game/GameManager";

export class NotePadMenu extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            notePadValue : "",
            notePadName: "Will",
            saved: true,
        };
    }
    componentDidMount(){
        this.loadNotePad(this.state.notePadName)
    }
    componentWillUnmount(){

    }
    loadNotePad(notePadName){
        this.setState({
            notePadName : notePadName,
            notePadValue : GameManager.client.savedNotePad[notePadName]?GameManager.client.savedNotePad[notePadName]:"",
            saved : true,
        });
    }
    clickSave(){
        this.setState({saved:true});
        GameManager.client.clickSaveNotePad(this.state.notePadName, this.state.notePadValue.trim());
    }
    render(){return(<div className="Main">
        <div className="Main-header">
            {this.state.notePadName}<br/>
        </div>

        <div className="Main-body">
            <div>
                <div style={{width:"45%", display:"inline-block"}}>
                    <Button text="Back" onClick={()=>{
                        MainMenu.instance.setRightPanel(<PlayerListMenu/>);
                    }}/>
                </div>
                <div style={{width:"45%", display:"inline-block"}}>
                    <Button text="Save" color={this.state.saved?null:GameManager.COLOR.IMPORTANT} onClick={()=>{
                        this.clickSave();
                    }}/>
                </div><br/>
                <div>

                <div style={{width:"45%", display:"inline-block"}}>
                    <Button text="Will" onClick={()=>{
                        this.loadNotePad("Will");
                    }}/>
                </div>
                <div style={{width:"45%", display:"inline-block"}}>
                    <Button text="Note" onClick={()=>{
                        this.loadNotePad("Note");
                    }}/>
                </div>
            </div>
            </div>
            <TextArea value={this.state.notePadValue} onChange={(e)=>{this.setState({saved:false, notePadValue : e.target.value});}}/><br/>
            
        </div>
    </div>);}

}