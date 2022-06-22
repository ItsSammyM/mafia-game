export class GameState{
    constructor(){
        this.roomCode = "";
        this.phase = "";
        this.started = false;
        this.players = [];
        this.chats = [];
    }
}
export const Phases = {
    Day: {
        phaseTime : 5,
    },
    Vote: {
        phaseTime : 5,
    },
    Judgement: {
        phaseTime : 5,
    },
    Night: {
        phaseTime : 5,
    },
    Mourning: {
        phaseTime : 5,
    }
}