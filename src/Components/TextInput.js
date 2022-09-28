import React from "react";
import "../styles/Main.css"


/**
 *  props:
 * 
 *      onChange(e):
 *          e : idk but its the thing from onChange
 * 
 *      notif : boolean
 *          determines css
 */
export function TextInput (props) {

    return (<input className="Main-box"
        type="text"
        onChange={
            (e)=>{
                (props.onChange ? props.onChange : ()=>{})(e)
            }
        }>
    </input>);
}