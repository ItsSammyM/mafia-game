export class CycleVariable{
    /**
     * @param _phaseNameReset - string or array of strings -- Name of phases to reset this variable at the start of
     * @param _valueReset - any - value to set value to when reset is called
     */
    constructor(_phaseNameReset, _valueReset){
        this.phaseNameReset = _phaseNameReset;
        this.valueReset = _valueReset;
        this.value = undefined;
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
    /**
     * @param obj - dictionary/object/array of values to reset 
     * @param phaseName - string of phase to reset at start of. If true then it will reset regardless
     */
    static objectResetIfPhase(obj, phaseName){
        if(phaseName){
            for(let i in obj)
                obj[i].reset();
            return;
        }

        for(let i in obj)
            obj[i].resetIfPhase(phaseName);
    }
}