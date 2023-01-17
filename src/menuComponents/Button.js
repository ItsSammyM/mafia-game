import React from "react";
import { Main } from "../Main";
import "../styles/Main.css"

/**
 * 
 * @param {Object} props 
 * @param {function} props.onClick
 * @param {String} props.text
 * @param {String} props.color
 * @param {String} props.width
 * @returns {JSX}
 */
export function Button(props){
        return (<button 
            className={"Main-box"} 
            style={{"backgroundColor": props.color, "width":props.width?props.width:"90%"}}
            onClick={
                ()=>{
                    //test for iphone sound effects.
                    Main.instance.state.soundEffect.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
                    Main.instance.setState({soundEffect: Main.instance.state.soundEffect});
                    Main.instance.state.soundEffect.play();

                    (props.onClick ? props.onClick : ()=>{})()
                }
            }>
                {props.text}
                {props.children}
        </button>);
}