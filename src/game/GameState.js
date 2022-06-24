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
    }
}