import Button  from "../Button";

export function MainMenu(props)
{
    return(
        <div className = "Main">
            <p className = "Main-header">
                <br/>
                Main
            </p>
            <p className = "Main-body">
                <br/>
                <Button text="Self"/>
                <br/>
                <Button text="Announcements"/>
                <br/>

                <br/>
                <Button text="Day" exclamation={true}/>
                <br/>
                <Button text="Mafia"/>
                <br/>
                <Button text="Dead"/>
                <br/>


                <br/>
                <Button text="Sam"/>
                <br/>
                <Button text="Brendan"/>
                <br/>
                <Button text="Thomas"/>
                <br/>
            </p>
        </div>
    );
}