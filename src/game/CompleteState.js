import { GameState } from "./GameState";
import { MyState } from "./MyState"

export class CompleteState{
    constructor(){
        this.myState = new MyState();
        this.gameState = new GameState();
    }
}