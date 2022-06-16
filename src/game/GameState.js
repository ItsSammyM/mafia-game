export class GameState{
    constructor(){
        this.roomCode = "";
        this.phase = "";
        this.phaseTimer = 0;
        this.started = false;
        this.players = [];
        this.chats = [];
    }
}