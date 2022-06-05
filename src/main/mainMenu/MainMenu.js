import Button  from "../Button";

export function MainMenu(props)
{
    return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Main
            </div>
            <div className = "Main-body">
                <br/>
                <div style={{display: "inline-block", width:"100%"}}>
                    <div style={{display: "inline-block", width:"30%"}}><Button style={{width:"100%", margin: 0, padding: 0, boarder: 0}} text="Self"/></div>
                    <div style={{display: "inline-block", width:"30%"}}><Button style={{width:"100%", margin: 0, padding: 0, boarder: 0}} text="Will"/></div>
                    <div style={{display: "inline-block", width:"30%"}}><Button style={{width:"100%", margin: 0, padding: 0, boarder: 0}} text="Target"/></div>
                </div>
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

                <br/>
                <Button text="Wiki"/>
                <br/>
            </div>
        </div>
    );
}