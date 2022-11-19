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
        <br/>
        <br/>
        <br/>
        <br/>
        <div className="Main-header">
            {this.state.notePadName}<br/>
        </div>

        <div className="Main-body">

            <div style={{width:"90%", display:"inline-block"}}>
                <Button width="50%" onClick={()=>{
                    this.loadNotePad("Will");
                }}>
                    <div style={this.state.notePadName==="Will"?{
                        "WebkitTextStroke": "3px rgb(20, 20, 20)",
                        "fontSize": "calc(10px + 2.3vmin)"
                    }:{}}>Will</div>
                </Button>

                <Button width="50%" onClick={()=>{
                    this.loadNotePad("Note");
                }}>
                    <div style={this.state.notePadName==="Note"?{
                        "WebkitTextStroke": "3px rgb(20, 20, 20)",
                        "fontSize": "calc(10px + 2.3vmin)"
                    }:{}}>Note</div>
                </Button>
            </div>

            <TextArea value={this.state.notePadValue} onChange={(e)=>{this.setState({saved:false, notePadValue : e.target.value});}}/><br/>

            <div style={{width:"90%", display:"inline-block"}}>
                <Button width="50%" text="Back" onClick={()=>{
                    MainMenu.instance.setRightPanel(<PlayerListMenu/>);
                }}/>
                <Button width="50%" text="Save" color={this.state.saved?null:GameManager.COLOR.IMPORTANT} onClick={()=>{
                    this.clickSave();
                }}/>
            </div><br/>

        </div>
        <br/>
        <br/>
        <br/>
        <br/>
    </div>);}

}