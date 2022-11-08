import React from "react";
import "../styles/Main.css"

/**
 * 
 * @param {Object} props 
 * @param {function} props.onChange
 * @param {String} props.options
 * @param {String} props.color
 * @param {String} props.width
 * @param {String} props.value
 * @returns {JSX}
 */
export function DropDown(props){
        return (<select 
            className={"Main-box"}
            value = {props.value?props.value:undefined}
            style={{"backgroundColor": props.color, "width":props.width?props.width:"90%"}}
            onChange={
                (e)=>{
                    (props.onChange ? props.onChange : ()=>{})(e)
                }
            }>
                {props.children}
        </select>);
}