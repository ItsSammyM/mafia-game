export class PlayerStateClient{
    constructor(name){
        this.name = name;
        this.availableButtons = {
            target: false,
            whisper: false,
            vote: false,
        };
        this.votedForNumber = 0;
    }
}