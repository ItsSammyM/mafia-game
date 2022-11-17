export class CycleVariable{
    /**
     * 
     * @param _phaseNameReset - string or array of strings -- Name of phases to reset this variable at the start of
     * @param _valueReset - any - value to set value to when reset is called
     */
    constructor(_phaseNameReset, _valueReset){
        this.phaseNameReset = _phaseNameReset;
        this.valueReset = _valueReset;
        this.value = undefined;
        //this.reset();
    }
    resetIfPhase(currentPhaseName){
        if(this.phaseNameReset.includes(currentPhaseName))  //this works for both a single value or an array of vales
            this.reset();
    }
    reset(){
        if('function' === (typeof this.valueReset)){
            this.value = this.valueReset();
        }else{
            this.value = this.valueReset;
        }
    }
    static objectResetIfPhase(obj, phaseName, force=false){
        if(force){
            for(let i in obj)
                obj[i].reset(phaseName);
            return;
        }

        for(let i in obj)
            obj[i].resetIfPhase(phaseName);
    }
}