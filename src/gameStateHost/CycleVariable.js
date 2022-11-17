export class CycleVariable{
    constructor(_phaseNameReset, _valueReset){
        this.phaseNameReset = _phaseNameReset;
        this.valueReset = _valueReset;
        this.value = undefined;
        this.reset();
    }
    resetIfPhase(currentPhaseName){
        if(this.phaseNameReset === currentPhaseName)
            this.reset();
    }
    reset(){
        if('function' == typeof this.valueReset){
            this.value = this.valueReset();
        }else{
            this.value = this.valueReset;
        }
    }
    static resetIfPhaseObject(obj, phaseName){
        for(let i in obj){
            obj[i].resetIfPhase(phaseName);
        }
    }
}