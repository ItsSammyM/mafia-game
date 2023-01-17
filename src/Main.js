import React from "react";
import { StartMenu } from "./menu/StartMenu.js"
import "./styles/Main.css"

export class Main extends React.Component {
    static instance = null;
    constructor(props) {
        super(props);
        Main.instance = this;

        this.state = {
            soundEffect: new Audio(),
            currentMenu: <StartMenu />,
            audioElement: null,
        };
    }
    componentDidMount() {
        //const soundEffect = new Audio();
        this.state.soundEffect.autoplay = true;

        // onClick of first interaction on page before I need the sounds
        // (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
        this.state.soundEffect.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
        this.setState({soundEffect: this.state.soundEffect});
        // later on when you actually want to play a sound at any point without user interaction
        //this.state.soundEffect.src = 'vine_boom.mp3';
        //this.state.soundEffect.play();
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
        // this.setState({audioElement: 
        //     <audio autoPlay>
        //     {/* <source src="vine_boom.ogg" type="audio/ogg"></source> */}
        //     <source src="vine_boom.mp3" type="audio/mpeg"></source>
        //     Your browser does not support audio.
        //     </audio>
        // });
        
        // new Promise(() => {
        //     setTimeout(() => {
        //         this.setState({audioElement:null});
        //     }, 3000);
        // });

        this.state.soundEffect.src = 'vine_boom.mp3';
        this.state.soundEffect.play();
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