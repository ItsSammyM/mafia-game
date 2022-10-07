class Role{
    /**
     * @param {string} _name
     * @param {string} _faction 
     * @param {string} _alignment
     * @param {int} _defense 
     * @param {bool} _roleblockable 
     * @param {bool} _witchable 
     * @param {bool} _isSuspicious 
     * @param {Object} _extraPersist 
     * @param {function} _doRole
     */
    constructor(_name, _faction, _alignment, _defense, _roleblockable, _witchable, _isSuspicious, _extraPersist, _doRole){
        this.name = _name;

        this.faction = _faction;
        this.alignment = _alignment;

        this.defense=_defense;

        this.roleblockable=_roleblockable;
        this.witchable=_witchable;

        this.isSuspicious=_isSuspicious;

        this.extraPersist=_extraPersist;
        this.doRole=_doRole;
    }
}
class Faction{
    /**
     * @param {string} _name 
     * @param {bool} _showFactionMembers 
     * @param {array[string]} _alignments 
     */
    constructor(_name, _showFactionMembers, _alignments){
        this.name = _name;
        this.showFactionMembers = _showFactionMembers;
        this.alignments = _alignments;
    }
}
export const FACTIONS = {
    "Town":new Faction("Town", false, ["Investigative", "Protective", "Killing", "Support"]),
    "Mafia":new Faction("Mafia", true, ["Killing", "Support", "Deception"])
};
export const ROLES = {
    "Sheriff":new Role(
        "Sheriff", "Town", "Investigative", 
        0, true, true, false, 
        {},
        (priority, player)=>{
            
        }
    ),
    "Escort":new Role(
        "Escort", "Town", "Support",
        0, false, true, false, 
        {},
        (priority, player)=>{

        }
    ),
    "Mafioso":new Role(
        "Mafioso", "Mafia", "Killing",
        0, true, true, true,
        {},
        (priority, player)=>{
            
        }
    )
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