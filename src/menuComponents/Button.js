import React from "react";
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
                    (props.onClick ? props.onClick : ()=>{})()
                }
            }>
                {props.text}
        </button>);
}