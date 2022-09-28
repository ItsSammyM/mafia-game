import React from "react";
import "../styles/Main.css"

/**
 *  props:
 * 
 *      text : string
 *          text on button
 * 
 *      onClick() : function
 *          function to call when clicked
 * 
 *      notif : boolean
 *          determines css
 */
export function Button(props){
    return (<button className={"Main-box"} 
    onClick={
        ()=>{
            (props.onClick ? props.onClick : ()=>{})()
        }
    }>
        {props.text}
    </button>);
}