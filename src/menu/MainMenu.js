import React from "react";
import { ChatMenu } from "./ChatMenu";
import "../styles/Main.css"
import { PlayerListMenu } from "./PlayerlistMenu";

export class MainMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            enteredMessage : "",
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    onChangeMessageListener(msg){
        this.setState({enteredMessage : msg})
    }
    render(){return(
        
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr",
        }}>

            {((msg)=>{
                return(<div style={{
                    gridColumn: 1,
                    gridRow: 1,
                    overflowY: "scroll",
                    overflowX: "hidden",
                    borderRight: "1px solid black",
                    maxHeight : "100vh",
                    width: !(!msg || msg==="") ? "100vw" : "50vw",
                }}>{<div><ChatMenu onChangeMessageListener={(msg) => this.onChangeMessageListener(msg)}/></div>}</div>)
            })(this.state.enteredMessage)}

            {((msg)=>{
                if(!msg || msg==="")
                    return(<div style={{
                        gridColumn: 2,
                        gridRow: 1,
                        overflowY: "scroll",
                        overflowX: "hidden",
                        borderLeft: "1px solid black",
                        maxHeight : "100vh",
                    }}>{<div><PlayerListMenu/></div>}</div>)
            })(this.state.enteredMessage)}
        </div>
    )}
}
/*
.splitScreen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr ;
}
.leftPane {
    grid-column: 1;
    grid-row: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    border-right: 1px solid black;
    max-height: 100vh; 
  }
.rightPane {
    grid-column: 2;
    grid-row: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    border-left: 1px solid black;
    max-height: 100vh; 
}
*/