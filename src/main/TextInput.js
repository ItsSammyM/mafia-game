import "./Main.css"

export function LineTextInput(props)
{
    return (
        <input 
        type="text" 
        defaultValue="" 
        onChange={(e) => props.onChange(e.target.value)} 
        className="Main-lineTextInput"
        ></input>
    );
}
export function TextInput(props)
{
    return (
        <textarea 
        type="text"
        defaultValue=""
        onChange={(e) => props.onChange(e.target.value)}
        className="Main-lineTextInput"
        ></textarea>
    );
}