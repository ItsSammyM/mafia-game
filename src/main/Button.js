import "./Main.css"

function Button(props)
{
    return (
        <button className = "Main-button">{props.name}</button>
    );
}

export default Button;