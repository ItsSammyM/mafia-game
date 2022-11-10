import React from "react";
import { Button } from "../menuComponents/Button";
import GameManager from "../game/GameManager";
import "../styles/Main.css"
import { DropDown } from "../menuComponents/DropDown";
import { ROLES } from "../game/ROLES";
import settings from "../settings"

export class StartHostMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode : props.roomCode,
            players : {},

            roleList : [],
            phaseTimes : {},
        };
        this.updatePlayers = {
            listener : (contents)=>{
                this.setState({players: GameManager.host.players});

                for(let i = 0; i < Object.keys(GameManager.host.players).length; i++){
                    if(i < this.state.roleList.length) continue;
                    this.state.roleList.push([null, null, null]);
                }

                this.setState({roleList : this.state.roleList});
            }
        };
    }
    componentDidMount() {
        if(GameManager.host.isHost)
            GameManager.CLIENT_TO_HOST["ASK_JOIN"].addReceiveListener(this.updatePlayers);

        for(let phaseTimesDefault in settings.defaultPhaseTimes){
            
            this.setDefaultPhaseTimes(phaseTimesDefault)
            break;
        }
    }
    componentWillUnmount() {
        GameManager.CLIENT_TO_HOST["ASK_JOIN"].removeReceiveListener(this.updatePlayers);
    }

    startButton(){
        GameManager.host.startGame(this.state.roleList, this.state.phaseTimes);
    }
    setDefaultRoleList(type){
        if(type==="All Any"){
            let playerNumb = Object.keys(this.state.players).length;
            for(let roleSlotIndex = 0; roleSlotIndex < playerNumb; roleSlotIndex++){
                for(let i = 0; i < 3; i++){
                    this.changeRoleList(roleSlotIndex, i, null);
                }
            }
            return;
        }
        let newRoleList = settings.defaultRoleLists[type][Object.keys(this.state.players).length];
        for(let roleSlotIndex in newRoleList){
            let roleSlot = newRoleList[roleSlotIndex];
            for(let i in roleSlot){
                this.changeRoleList(roleSlotIndex, i, newRoleList[roleSlotIndex][i]);
            }
        }
    }
    setDefaultPhaseTimes(type){
        let phaseTimes = {};
        for(let phase in settings.defaultPhaseTimes[type]){
            phaseTimes[phase] = settings.defaultPhaseTimes[type][phase]
        }
        this.setState({phaseTimes : phaseTimes});
    }

    renderPlayers(players){
        let out = [];
        for(let playerName in players){
            out.push(<div key={playerName}>{playerName}</div>);
        }
        return out;
    }
    renderRoleListPickers(roleList){
        let roleListPickers = [];

        for(let i in roleList){
            roleListPickers.push(<div key={i}>{this.renderRolePicker(i, roleList)}</div>);
        }
        
        return(roleListPickers);
    }
    changeRoleList(i, f, v){
        let copy = this.state.roleList;
        if(v==="Any") v=null;
        copy[i][f] = v?v:null;
        this.setState({roleList : copy});
    }
    renderRolePicker(i, roleList){
        let factions = [null];
        let alignments = [null];
        let exactRoles = [null];

        for(let roleName in ROLES){

            exactRoles.push(roleName);

            if(!factions.includes(ROLES[roleName].faction))
                factions.push(ROLES[roleName].faction);

            if(!alignments.includes(ROLES[roleName].alignment) && (ROLES[roleName].faction === roleList[i][0] || !roleList[i][0]))
                alignments.push(ROLES[roleName].alignment);
        }

        return(<div>
            <DropDown width="30%" value={roleList[i][0]?roleList[i][0]:"Any"} onChange={(e)=>{this.changeRoleList(i, 0, e.target.value)}}>
                {factions.map((p, i)=>{return(<option key={i}>{p?p:"Any"}</option>)})}
            </DropDown>
            <DropDown width="30%" value={roleList[i][1]?roleList[i][1]:"Any"} onChange={(e)=>{this.changeRoleList(i, 1, e.target.value)}}>
                {alignments.map((p, i)=>{return(<option key={i}>{p?p:"Any"}</option>)})}
            </DropDown>
            <DropDown width="30%" value={roleList[i][2]?roleList[i][2]:"Any"} onChange={(e)=>{this.changeRoleList(i, 2, e.target.value)}}>
                {exactRoles.map((p, i)=>{return(<option key={i}>{p?p:"Any"}</option>)})}
            </DropDown>
        </div>
    )}
    render() {return (<div className="Main">
        <div className="Main-header">
            Mafia
        </div><br/>
        <div className="Main-body">
            Room Code:<br/>
            {this.state.roomCode}<br/>
            <br/>
            {this.renderPlayers(this.state.players)}
            {(()=>{
                if(Object.keys(this.state.players).length>0) 
                    return <div><Button text="Start" onClick={()=>this.startButton()}/><br/></div>
            })()}
            <br/>

            Phase Times<br/>
            <DropDown onChange={(e)=>{
                this.setDefaultPhaseTimes(e.target.value)
            }}>
                {(()=>{
                    let defaultPhaseTimesOptions = [];
                    for(let phaseTimesName in settings.defaultPhaseTimes){
                        defaultPhaseTimesOptions.push((<option key={phaseTimesName}>{phaseTimesName}</option>));
                    }
                    return defaultPhaseTimesOptions;
                })()}
            </DropDown><br/>
            <br/>
            Role Lists<br/>
            <Button text="Mafia" width="30%" onClick={()=>{
                this.setDefaultRoleList("Mafia");
                
            }}/>
            <Button text="All Any" width="30%" onClick={()=>{
                this.setDefaultRoleList("All Any");
            }}/>
            <Button text="Vampires" width="30%" onClick={()=>{
                this.setDefaultRoleList("Vampire");
            }}/>

            {this.renderRoleListPickers(this.state.roleList)}<br/>
        </div>
    </div>);}
}