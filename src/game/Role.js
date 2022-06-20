export class Role{
    constructor(title){
        this.title = title;
        this.doRole = function(priority, player, targets){
            if(player === null) return; if(targets === null) return; if(priority === null) return;
            this.doMyRole(priority, player, targets);
        }
        switch(title){
            case "Sheriff":
                this.faction = "Town";
                this.alignment = "Investigative";
                this.doMyRole = function(priority, player, targets){
                    if(targets.length < 1) return;
                };
                break;
            case "Mafioso":
                this.faction = "Mafia";
                this.alignment = "Killing";
                this.doMyRole = function(priority, player, targets){
                    if(targets.length < 1) return;
                    targets[0].alive = false;
                };
                break;
            case "Jester":
                this.faction = "Neutral";
                this.alignment = "Neutral";
                this.doMyRole = function(priority, player, targets){
                    if(targets.length < 1) return;
                    targets[0].alive = false;
                };
                break;
            default:
                console.log("Error line 33 Role.js. No role title");
        }
    }
}
/*
Priority
Everyones target is set first

-6 Godfather(Target for mafioso)
-5 Veteran (go on alert) 
-4 Transporter (Swaps targets)
-3 Escort (Roleblock)
-2 Vampire(convert)
-1 Disguiser(Swap results)
0: Sheriff
1: Mafioso, SerialKiller, Godfather
2
3
4
5
*/


/*
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