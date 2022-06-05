import React from "react";
import "./Main.css"
import { OpenMenu, HostMenu, JoinMenu } from "./openMenu/OpenMenu";
import GameManager from "../game/GameManager.";


class Main extends React.Component
{
  constructor(props)
  {
    super(props);
    Main.instance = this;

    this.state = {
        currentMenu : <OpenMenu 
            onHost={()=>{
                this.setState({currentMenu: <HostMenu onStart={()=>{}}/>})
                GameManager.instance.startHost();
            }} 
            onJoin={()=>{
                this.setState({currentMenu: <JoinMenu onStart={()=>{GameManager.instance.joinGame()}}/>})
            }}
        />
    };
  }
  static instance = null;
  render()
  {
    return (this.state.currentMenu);
  }
}

export default Main