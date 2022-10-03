import React from "react";
import "../styles/Main.css"


/**
 * 
 * @param {Object} props
 * @param {bool} props.notif
 * @param {function} props.onChange - param e
 * @param {function} props.onKeyPress - param e
 * @param {function} props.onEnter
 * @returns {JSX}
 */
export function TextInput (props) {
    return (<input className={props.notif ? "Main-box-notif" : "Main-box"}
        type="text"
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