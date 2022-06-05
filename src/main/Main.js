import React from "react";
import "./Main.css"
import { OpenMenu, HostMenu, JoinMenu } from "./openMenu/OpenMenu";
import { MainMenu } from "./mainMenu/MainMenu";
import GameManager from "../GameManager.";


class Main extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
        currentMenu : <OpenMenu 
            onHost={()=>{
                this.setState({currentMenu: <HostMenu onStart={()=>alert("s")}/>})
                GameManager.instance.startHost();
            }} 
            onJoin={()=>{
                this.setState({currentMenu: <JoinMenu onStart={()=>{GameManager.instance.joinGame()}}/>})
            }}
        />
    };
  }
  render()
  {
    return (this.state.currentMenu);
  }
}

export default Main