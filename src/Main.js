import React from "react";
import { OpenMenu } from "./menu/OpenMenu";
import "./styles/Main.css"

export class Main extends React.Component
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