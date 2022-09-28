import React from "react";
import "../styles/Main.css"


/**
 * 
 * @param {Object} props
 * @param {bool} props.notif
 * @param {function} props.onChange
 * @returns {JSX}
 */
export function TextInput (props) {

    return (<input className={props.notif ? "Main-box-notif" : "Main-box"}
        type="text"
        onChange={
            (e)=>{
                (props.onChange ? props.onChange : ()=>{})(e)
            }
        }>
    </input>);
}