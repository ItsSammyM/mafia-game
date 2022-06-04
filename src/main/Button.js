import "./Main.css"

function Button(props)
{
    let css = "Main-button";
    let text = props.text;

    if(props.exclamation == true){
        css = "Main-button-exclamation";
        text = "! ! ! " + text + " ! ! !";
    }

    return (
        <button className = {css} onClick={props.onClick}>{text}</button>
    );
}

export default Button;