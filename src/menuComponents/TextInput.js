import React from "react";
import "../styles/Main.css"


/**
 * 
 * @param {Object} props
 * @param {function} props.onChange - param e
 * @param {function} props.onKeyPress - param e
 * @param {function} props.onEnter
 * @param {String} props.color
 * @returns {JSX}
 */
export function TextInput (props) {
    return (<input className={"Main-box"}
        style={{"backgroundColor": props.color}}
        type="text"
        placeholder="Start Typing..."
        onKeyPress={
            (e) => {
                if(e.code === "Enter") {
                    (props.onEnter ? props.onEnter : ()=>{})();
                }
                (props.onKeyPress ? props.onKeyPress : ()=>{})(e);
            }
        }
        onChange={
            (e)=>{
                (props.onChange ? props.onChange : ()=>{})(e);
            }
        }>
    </input>);
}