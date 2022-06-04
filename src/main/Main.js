import React from "react";
import "./Main.css"
import TextInput from "./TextInput";
import Button from "./Button";

class Main extends React.Component
{
  constructor(props)
  {
    super(props);

  }
  render()
  {
    return (
        <div className = "Main">
            <p className = "Main-header">
                <br/>
                Mafia
            </p>
            <p className = "Main-body">
                Name
                <br/>
                <TextInput/>
                <br/>
                <br/><br/>
                <Button name="Host New Game"/>
                
                <br/><br/>
                <Button name="Join Game"/>
            </p>
        </div>
    );
  }
}

export default Main