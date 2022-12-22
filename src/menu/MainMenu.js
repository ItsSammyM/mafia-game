import React from "react";
import { ChatMenu } from "./ChatMenu";
import "../styles/Main.css"
import { PlayerListMenu } from "./PlayerlistMenu";

export class MainMenu extends React.Component {
    static instance;
    constructor(props){
        super(props);

        this.state = {
            enteredMessage : "",

            rightPanel : <PlayerListMenu/>,
            backgroundColor: "#2d3646",
        }
    }
    componentDidMount() {
        MainMenu.instance = this;
    }
    componentWillUnmount() {
        MainMenu.instance = undefined;
    }
    onChangeMessageListener(msg){
        this.setState({enteredMessage : msg})
    }
    setBackgroundColor(c){
        this.setState({backgroundColor: c});
    }
    setRightPanel(s){
        this.setState({rightPanel : s})
    }
    render(){return(
        
        <div style={{
            display: "grid",
            backgroundColor: this.state.backgroundColor,
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr",
        }}>

            {((msg)=>{
                return(<div style={{
                    gridColumn: 1,
                    gridRow: 1,
                    overflowX: "hidden",
                    borderRight: "1px solid black",
                    maxHeight : "100vh",
                    width: !(!msg || msg==="") ? "100vw" : "50vw",
                }}>
                    <ChatMenu onChangeMessageListener={(msg) => this.onChangeMessageListener(msg)}/>
                </div>)
            })(this.state.enteredMessage)}

            {((msg)=>{
                if(!msg || msg==="")
                    return(<div style={{
                        gridColumn: 2,
                        gridRow: 1,
                        overflowX: "hidden",
                        borderLeft: "1px solid black",
                        maxHeight : "100vh",
                    }}>
                        {this.state.rightPanel}
                    </div>)
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