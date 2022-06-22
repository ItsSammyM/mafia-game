import { GameManager } from "./GameManager";

export const AllRoles = {
    Sheriff: {
        faction : "Town",
        alignment : "Investigative",
        roleblockable : true,
        defense : 0,
        doRole : function(priority, player){
            if(player.role.targeting.length < 1) return;
            if(priority!==2) return;
        }
    },
    Mafioso: {
        faction : "Mafia",
        alignment : "Killing",
        roleblockable : true,
        defense : 0,
        doRole : function(priority, player){
            if(player.role.targeting.length < 1) return;
            if(priority!==3) return;
        }
    },
    Consort: {
        faction : "Mafia",
        alignment : "Support",
        roleblockable : false,
        defense : 0,
        doRole : function(priority, player){
            if(player.role.targeting.length < 1) return;
            if(priority!==0) return;
        }
    },
}
export class MyRole{
    constructor(roleTitle){
        this.roleTitle = roleTitle;

        this.roleblocked = false;
        this.currentDefense = 0;
        this.targeting = [];
        this.targetedBy = [];
        // for(let property in role){
        //     console.log(property, role[property])
        // }
    }
    static doMyRole = function(priority, player){
        if(player === null || player.role===null || priority === null || player.role.roleblocked) return;
        AllRoles[player.role.roleTitle].doRole(priority, player);
    }
    static constructDefaultRole(roleTitle){
        //find role in list
        for(let role in AllRoles){
            if(role===roleTitle){
                //copy once found and return new
                let myRole = GameManager.deepCopy(AllRoles[role]);
                return myRole;
            }
        }
        return null;
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