import React from "react";
import "../styles/Main.css"

/**
 * 
 * @param {Object} props 
 * @returns {JSX}
 */
export function Button(props){
    return (<button className={props.notif ? "Main-box-notif" : "Main-box"} 
    onClick={
        ()=>{
            (props.onClick ? props.onClick : ()=>{})()
        }
    }>
        {props.text}
    </button>);
}