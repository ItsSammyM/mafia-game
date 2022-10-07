class Phase{
    constructor(_maxTime, _onStart, _onTimeOut){
        this.maxTime = _maxTime;
        this.onStart = _onStart;
        this.onTimeOut = _onTimeOut;
    }
}
const PHASES = {
    "Night":new Phase(10, 
        ()=>{

        }, 
        ()=>{
            //set loop first
            //main loop 
            //reset loop after
        }
    ),
    "Morning":new Phase(10,
        ()=>{
            
        },
        ()=>{

        }
    ),
    "Discussion":new Phase(10),
    "Voting":new Phase(10),
    "Testimony":new Phase(10),
    "Judgement":new Phase(10),
}
export let PhaseStateMachine = {
    currentPhase : null,
    timeLeft : 0,
    startPhase : (phaseName)=>{
        currentPhase = phaseName;
        PHASES[currentPhase].onStart();
    },
    tick : ()=>{
        if(currentPhase)
            PhaseStateMachine.timeLeft--;
        



        if(PhaseStateMachine.timeLeft===0){
            PHASES[currentPhase].onTimeOut();
        }
    }
}