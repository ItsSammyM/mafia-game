import { GameManager } from "../game/GameManager";

export class WaitGameStartMenu extends React.Component{
    constructor(props){
        super(props);

        
        this.state = {completeState : GameManager.instance.completeState};
        this.stateListener = (s) => {
            this.setState({completeState : s})
        };
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    renderPlayer(player){return(
        <div className = "Main-header" key={player.name}>
            {player.name}
        </div>
    );}
    render(){return(
        <div className = "Main">
            <div className = "Main-header">
                <br/>
                Mafia
            </div>
            <div className="Main-body">
                Name: {this.state.gameState.name}
                <br/>
                Room Code : {this.state.gameState.roomCode}
                <br/>
                <br/>
                Players
                <br/>
                <br/>
                {this.state.gameState.players.map((p)=>{
                    return this.renderPlayer(p)
                })}
            </div>
        </div>
    );}
}