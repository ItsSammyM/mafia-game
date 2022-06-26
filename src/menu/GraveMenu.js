import { GameManager } from "../game/GameManager";

export class GraveMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            playerName : props.playerName,
            completeState : GameManager.instance.completeState
        };
        this.stateListener = {stateUpdate :(s) => {
            this.setState({completeState : s});
        }};
    }
    componentDidMount(){
        GameManager.instance.addListener(this.stateListener);
    }
    componentWillUnmount(){
        GameManager.instance.removeListener(this.stateListener);
    }
    render(){return(<div className="Main">
        <div className="Main-head">
            Grave of {this.state.playerName}
        </div>
    </div>);}
}