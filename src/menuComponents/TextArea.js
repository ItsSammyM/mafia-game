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
export function TextArea (props) {
    return (<textarea className={"Main-box"}
        style={{"backgroundColor": props.color, minHeight: "70vh"}}
        type="text"
        value={props.value}
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
                (props.onChange ? props.onChange : ()=>{})(e);//e.target.value
            }
        }>
    </textarea>);
}
/*
<textarea className="Main-lineTextInput" value={this.state.enteredAlibi}
            style={{minHeight: "70vh"}}
            onChange={(e)=>{
                this.setState({enteredAlibi : e.target.value});
        }}/>
*/