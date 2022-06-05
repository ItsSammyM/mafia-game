import "./Main.css"

function Button(props)
{
    let css = "Main-button";
    if(props.className) css = props.className;

    let text = props.text;
    let style = {};

    if(props.exclamation == true){
        style = {
            color: "rgb(253, 221, 78)",
            fontSize: "calc(15px + 2vmin)",
            fontWeight: 1000
        }
        text = "! ! ! " + text + " ! ! !";
    }

    return (
        <button style={style}
        className = {css} 
        onClick={props.onClick}>{text}</button>
    );
}

export default Button;