import React from "react";
import "./Main.css"
import { OpenMenu } from "./openMenu/OpenMenu";
import { MainMenu } from "./mainMenu/MainMenu";


class Main extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
        currentMenu : <OpenMenu onHostStart={()=>{}} onJoin={()=>{}}/>
    };
    this.instance = this;
  }
  static instance;
  render()
  {
    return (this.state.currentMenu);
  }
}

export default Main