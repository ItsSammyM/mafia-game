import React from "react";
import { StartMenu } from "./menu/StartMenu.js"
import "./styles/Main.css"

export class Main extends React.Component {
    static instance = null;
    constructor(props) {
        super(props);
        Main.instance = this;

        this.state = {
            currentMenu: <StartMenu />,
            audioElement: null,
        };
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }

    // function resolveAfter2Seconds() {
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         resolve('resolved');
    //       }, 2000);
    //     });
    //   }
      
    //   async function asyncCall() {
    //     console.log('calling');
    //     const result = await resolveAfter2Seconds();
    //     console.log(result);
    //     // Expected output: "resolved"
    //   }
      
    //   asyncCall();

    playSound(){
        this.setState({audioElement: 
            <audio autoPlay>
            {/* <source src="vine_boom.ogg" type="audio/ogg"></source> */}
            <source src="vine_boom.mp3" type="audio/mpeg"></source>
            Your browser does not support audio.
            </audio>
        });
        
        new Promise(() => {
            setTimeout(() => {
                this.setState({audioElement:null});
            }, 3000);
        });
    }
    render() {return (<div className="body">
        <br/>
        {this.state.currentMenu}
        {this.state.audioElement}
        
    </div>);}

    changeMenu(menu){
        this.setState({currentMenu:menu});
    }
}