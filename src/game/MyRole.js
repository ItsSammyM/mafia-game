export class MyRole{
    constructor(roleTitle){
        //involving just tonights role
        this.roleTitle = roleTitle;
        this.alive = true;

        this.cycleReset();
    }
    cycleReset(){
        this.roleblocked = false;
        this.currentDefense = 0;
        this.targeting = [];    //list of player names
        this.targetedBy = [];   //list of player names
    }
}
/*
Priority
Everyones target is set first

-3: Veteran(Decides Alert) Vigilante(Suicide) Jester(Kill)
-2: Transporter(Swaps)
-1: Witch(Swaps)
 0: Escort / Consort(Roleblock)
+1: Doctor(Heal), Blackmailer(Decide), Crusader(Heal), bodyguard(Heal & swap), Arsonist(Douse), Framer, Disguiser
+2: Sheriff, Invest, Consig, Lookout, Tracker,
+3: Mafioso/Godfather, SerialKiller, Werewolf, Veteran, Vampire, Arsonist, Crusader, Bodyguard, Vigilante (All kill)
+4: Spy(Collect info) Amnesiac(Convert) Vampire(Convert) Forger(Change info), Janitor(Clean)

--------
investigator idea

Lets say rolelist is
TI
TI
TS
TP
TK
GF
MAFIOSO
MR
MR
NK
NE

lets say your a doctor
First it picks you and 2 othing things from other factions randomly
---
Doctor,
Mafia Random
Neutral Killing
---- then it narrows it down randomly
Doctor
Blackmailer
Arsonist
---
It generates these for each player at the beginning in order to ensure that you cant investigate soemone 2 times and get different results
It should tell you your own results so you can fake easier.
*/