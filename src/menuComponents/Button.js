import React from "react";
import "../styles/Main.css"

/**
 * 
 * @param {Object} props 
 * @param {function} props.onClick
 * @param {String} props.text
 * @param {String} props.color
 * @returns {JSX}
 */
export function Button(props){
        return (<button 
            className={"Main-box"} 
            style={{"backgroundColor": props.color}}
            onClick={
                ()=>{
                    (props.onClick ? props.onClick : ()=>{})()
                }
            }>
                {props.text}
        </button>);
}