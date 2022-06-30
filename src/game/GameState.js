export class GameState{
    constructor(){
        this.roomCode = "";

        this.roleList = [];

        this.phase = "";
        this.dayNumber = 1;
        this.phaseTimer = 0;
        
        this.started = false;
        this.players = [];
        this.chats = [];

        this.onTrialName = null;
        this.giveInformation = [];
    }
    addGiveInformation(information, isPublic=true){
        this.giveInformation.push({
            information : information,
            isPublic : isPublic
        });
    }
    addGiveInformationList(list){
        for(let i = 0; i < list.length; i++){
            this.giveInformation.push(list[i]);
        }
    }
    cycleReset(){
        this.giveInformation = [];
        this.onTrialName = null;
    }
}