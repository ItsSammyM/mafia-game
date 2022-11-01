import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import GameManager from "./GameManager"

export class Role{
    /**
     * @param {string} _name
     * @param {string} _faction 
     * @param {string} _alignment
     * @param {string} _team
     * @param {int} _defense 
     * @param {bool} _roleblockable 
     * @param {bool} _witchable 
     * @param {bool} _isSuspicious 
     * @param {Object} _extraPersist 
     * @param {function} _doRole
     */
    constructor(

        _name, _basicDescription, _emoji,
        _faction, _alignment, _team, _maximumCount,
        _defense, _roleblockable, _witchable, _isSuspicious, 
        _extraPersist, 
        _doRole, 
        _canTargetFunction
    
        ){
        this.name = _name;
        this.emoji = _emoji;
        this.basicDescription = _basicDescription;

        this.faction = _faction;
        this.team = _team;
        this.alignment = _alignment;

        this.defense=_defense;

        this.roleblockable=_roleblockable;
        this.witchable=_witchable;

        this.isSuspicious=_isSuspicious;

        this.maximumCount = _maximumCount;
        //-1 is infinite, 0 is you cant have one. 1 is normal unique

        this.canTargetFunction = _canTargetFunction ? _canTargetFunction : (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return (
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.role.cycle.targeting.length < 1    //havent already targeted at least 1 person
            );
        };

        this.extraPersist=_extraPersist;
        this.doRole=_doRole;
    }
    static onSameTeam(playerA, playerB){
        return playerA.role.getRoleObject().team === playerB.role.getRoleObject().team && //same team
        playerA.role.getRoleObject().team!==null;  //not null
    }
}
class TEAM{
    /**
     * @param {string} _name 
     * @param {boolean} _showFactionMembers 
     */
    constructor(_name, _showFactionMembers){
        this.name = _name;
        this.showFactionMembers = _showFactionMembers;
    }
}

export const TEAMS = {
    "Mafia":new TEAM("Mafia", true),
};
export const ROLES = {
    //#region Town
    "Sheriff":new Role(
        "Sheriff", "Target a player to find out if they're innocent or suspicious", "🕵️",
        "Town", "Investigative", null, Infinity,
        0, true, true, false, 
        {},
        (priority, player)=>{
            if(priority !== 4) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            player.role.cycle.nightInformation.push(new ChatMessageState(
                null,
                "Your target seems to be " + (player.role.cycle.targeting[0].role.cycle.isSuspicious ? "suspicious." : "innocent."),
                GameManager.COLOR.GAME_TO_YOU
            ));
        }
    ),
    "Doctor":new Role(
        "Doctor", "Target a player to save them from an attack, you can save yourself once", "💉",
        "Town", "Protective", null, 0,
        0, true, true, false,
        {selfHealed : false},
        ()=>{

        },
        (myPlayer, otherPlayer)=>{
            
            return (
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 1 && //im targeting nobody already
                (
                    (myPlayer.name===otherPlayer.name && !myPlayer.role.persist.extra.selfHealed) || //self healing
                    myPlayer.name!==otherPlayer.name //healing someone else
                ) 
            );
        }
    ),
    "Escort":new Role(
        "Escort", "Target a player to roleblock them, they cannot use their role for that night", "💋",
        "Town", "Support", null, Infinity,
        0, false, true, false, 
        {},
        (priority, player)=>{
            if(priority !== -6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            player.role.cycle.targeting[0].roleblock();
        }
    ),
    //#endregion
    //#region Mafa
    "Mafioso":new Role(
        "Mafioso", "Target a player to kill them, the godfathers choice could override yours", "🌹",
        "Mafia", "Killing", "Mafia", 1,
        0, true, true, true,
        {},
        (priority, player)=>{
            if(priority !== 6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            player.role.cycle.targeting[0].tryNightKill(player, 1);
        }
    ),
    "Consort":new Role(
        "Consort", "Target a player to roleblock them, they cannot use their role for that night", "💄",
        "Mafia", "Support", "Mafia", Infinity,
        0, false, true, true, 
        {},
        (priority, player)=>{
            if(priority !== -6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            player.role.cycle.targeting[0].roleblock();
        }
    ),
    //#endregion
}

/*
Priority
Everyones target is set first

-12: Veteran(Decides Alert) Vigilante(Suicide) Jester(Kill) 
-10: Transporter(Swaps)
-8: Witch(Swaps)
-6: Escort / Consort(Roleblock)
-4 Godfather(Swap mafioso target and clear self)
-2 bodyguard(swap)
0: visits happen here
+2: Doctor(Heal), Blackmailer(Decide), Crusader(Heal), Arsonist(Douse), Framer, Disguiser
+4: Sheriff, Invest, Consig, Lookout, Tracker,
+6: Mafioso/Godfather, SerialKiller, Werewolf, Veteran, Vampire, Arsonist, Crusader, Bodyguard, Vigilante (All kill)
+8: Spy(Collect info) Amnesiac(Convert) Vampire(Convert) Forger(Change info), Janitor(Clean)
+10 Witch(Steal info)

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

Randomly generates investigative results before the start of each match. Wiki tab will show what all the options are

Town Town Neutral Mafia Coven
*/

export function getRandomFaction(alreadyPickedRolesList){
    //get all factions and pick random one
    let a = getFactionList(alreadyPickedRolesList);
    return a[
        Math.floor(a.length*Math.random())
    ];
}
export function getRandomAlignment(faction, alreadyPickedRolesList){

    if(faction==="Random") faction = getRandomFaction(alreadyPickedRolesList);

    let a = getAlignmentList(faction, alreadyPickedRolesList);
    return a[
        Math.floor(a.length*Math.random())
    ];
}
export function getRandomRole(faction, alignment, alreadyPickedRolesList){

    if(faction==="Random") faction = getRandomFaction(alreadyPickedRolesList);
    if(alignment==="Random") alignment = getRandomAlignment(faction, alreadyPickedRolesList);

    let a = getRoleList(faction, alignment, alreadyPickedRolesList)
    return a[
        Math.floor(a.length*Math.random())
    ];
}

export function getFactionList(alreadyPickedRolesList){
    let allFactions = [];
    for(let roleName in ROLES){
        let r = ROLES[roleName];

        //how many of this role is already picked
        let alreadyPickedCount = 0;
        for(let i in alreadyPickedRolesList){
            if(roleName === alreadyPickedRolesList[i]){
                alreadyPickedCount++;
            }
        }

        if(
            !allFactions.includes(r.faction) &&
            alreadyPickedCount < r.maximumCount
        ) 
        allFactions.push(r.faction);
    }
    return allFactions;
}
export function getAlignmentList(faction, alreadyPickedRolesList){
    let allAlignments = [];
    for(let roleName in ROLES){
        let r = ROLES[roleName];

        //how many of this role is already picked
        let alreadyPickedCount = 0;
        for(let i in alreadyPickedRolesList){
            if(roleName === alreadyPickedRolesList[i]){
                alreadyPickedCount++;
            }
        }

        if(
            !allAlignments.includes(r.alignment) && 
            alreadyPickedCount < r.maximumCount &&
            r.faction===faction
        ) 
        allAlignments.push(r.alignment);
    }
    return allAlignments;
}
export function getRoleList(faction, alignment, alreadyPickedRolesList){
    let allRoles = [];
    for(let roleName in ROLES){
        let r = ROLES[roleName];

        //how many of this role is already picked
        let alreadyPickedCount = 0;
        for(let i in alreadyPickedRolesList){
            if(roleName === alreadyPickedRolesList[i]){
                alreadyPickedCount++;
            }
        }

        if(
            !allRoles.includes(r.name) && 
            alreadyPickedCount < r.maximumCount &&
            r.faction === faction && r.alignment === alignment
        ) 
        allRoles.push(r.name);
    }
    return allRoles;
}
// export const ROLES = {
//     Sheriff: {
//         faction : "Town",
//         alignment : "Investigative",
//         roleblockable : true,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==4) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             player.addGiveInformation("Your target was found to be "+ROLES[targeted.role.roleTitle].interrogationResults,false);
//         }
//     },
//     Lookout: {
//         faction : "Town",
//         alignment : "Investigative",
//         roleblockable : true,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==4) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             let v = "";
//             for(let i = 0 ; i < targeted.role.targetedBy.length; i++){
//                 v+=targeted.role.targetedBy[i]+", ";
//             }
//             v = v.substring(0,v.length-2);
//             player.addGiveInformation("The visitors to your target were "+v,false);
//         }
//     },
//     Escort: {
//         faction : "Town",
//         alignment : "Support",
//         roleblockable : false,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==-6) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             targeted.roleBlock();
//         }
//     },
//     Transporter: {
//         faction : "Town",
//         alignment : "Support",
//         roleblockable : false,
//         witchable : false,
//         defense : 0,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 2) return;

//             if(priority!==-10) return;

//             let playerA = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             let playerB = GameManager.instance.getPlayerFromName(player.role.targeting[1]);

//             playerA.addGiveInformation("You were transported!", false);
//             playerB.addGiveInformation("You were transported!", false);

//             for(let i = 0; i < GameManager.instance.completeState.gameState.players.length; i++){
//                 let swapTargetPlayer = GameManager.instance.completeState.gameState.players[i];
                
//                 for(let j = 0; j < swapTargetPlayer.role.targeting.length; j++){
//                     if(swapTargetPlayer.role.targeting[j] === playerA.name){
//                         swapTargetPlayer.role.targeting[j] = playerB.name
//                     }else if(swapTargetPlayer.role.targeting[j] === playerB.name){
//                         swapTargetPlayer.role.targeting[j] = playerA.name
//                     }
//                 }
//             }
//         }
//     },
//     Mafioso: {
//         faction : "Mafia",
//         alignment : "Killing",
//         roleblockable : true,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Suspicious",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==6) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             targeted.nightKill(player);
//         }
//     },
//     Godfather: {
//         faction : "Mafia",
//         alignment : "Killing",
//         roleblockable : true,
//         witchable : true,
//         defense : 1,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);

//             if(priority===-4){
//                 let mafioso = GameManager.instance.getPlayerByRole("Mafioso");
//                 if(mafioso !== null) player.role.extra.foundMafioso = true;

//                 if(player.role.extra.foundMafioso && !mafioso.role.extra.witched && mafioso !== targeted){
//                     mafioso.role.targeting = [targeted.name];
//                     mafioso.addGiveInformation("The godfather ordered you to attack his target", false);
//                     player.role.targeting = [];
//                 }
//             }else if(priority===6 && !player.role.extra.foundMafioso){
//                 targeted.nightKill(player);
//             }            
//         }
//     },
//     Consort: {
//         faction : "Mafia",
//         alignment : "Support",
//         roleblockable : false,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Suspicious",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==-6) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             targeted.roleBlock();
//         }
//     },
//     Janitor: {
//         faction : "Mafia",
//         alignment : "Support",
//         roleblockable : false,
//         witchable : true,
//         defense : 0,
//         interrogationResults : "Suspicious",
//         extraPersist : { cleans : 3 },
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
//             if(player.role.targeting.length < 1) return;
//             if(priority!==8) return;

//             let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
//             if(targeted.role.alive === true) return;

//             if(player.role.extraPersist.Janitor.cleans <= 0){player.addGiveInformation("You have already used all of your cleans", false); return;}

//             targeted.grave = new GraveState("Alibi was cleaned", "Cleaned", "", "");
//             player.role.extraPersist.Janitor.cleans--;
//         }
//     },
//     Witch: {
//         faction : "Neutral",
//         alignment : "Evil",
//         roleblockable : false,
//         witchable : false,
//         defense : 1,
//         interrogationResults : "Innocent",
//         extraPersist : {},
//         doRole : function(priority, player){
//             if(!player.role.aliveTonight) return;
            
//             if(priority===-8){
//                 if(player.role.targeting.length < 2) return;
//                 let controlled = GameManager.instance.getPlayerFromName(player.role.targeting[0]);

//                 if(controlled.getMyRole().witchable){
//                     controlled.role.extra.witched = true;
//                     controlled.role.targeting[0] = player.role.targeting[1];
//                     player.role.targeting = [player.role.targeting[0]];

//                     controlled.addGiveInformation("You were controlled by the witch, your target was changed.", false);
//                     player.role.extra.controlled = controlled;
//                 }
//             }
//             if(priority===10 && player.role.extra.controlled){
//                 player.addGiveInformation("Your targets role is "+player.role.extra.controlled.role.roleTitle+"\n here is the information they recieved");
//                 player.addGiveInformationList(player.role.extra.controlled.giveInformation);
//             }
//         }
//     }
// }

