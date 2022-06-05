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
        currentMenu : <OpenMenu/>
    };
  }
  static instance = null;
  render()
  {
    return (this.state.currentMenu);
  }
}

export default Main