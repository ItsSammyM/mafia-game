import React from "react";
import "../styles/Main.css"

/**
 * 
 * @param {Object} props 
 * @param {function} props.onClick
 * @param {boolean} props.notif
 * @param {String} props.text
 * @param {String} props.color
 * @returns {JSX}
 */
export function Button(props){
        return (<button 
            className={props.notif ? "Main-box-notif" : "Main-box"} 
            style={{"backgroundColor": props.color}}
            onClick={
                ()=>{
                    (props.onClick ? props.onClick : ()=>{})()
                }
            }>
                {props.text}
        </button>);
}