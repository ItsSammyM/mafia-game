import { GameManager } from "./GameManager";

export const AllRoles = {
    Sheriff: {
        faction : "Town",
        alignment : "Investigative",
        roleblockable : true,
        defense : 0,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==2) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            player.addGiveInformation("Your target was found to be "+AllRoles[targeted.role.roleTitle].interrogationResults,false);
        }
    },
    Mafioso: {
        faction : "Mafia",
        alignment : "Killing",
        roleblockable : true,
        defense : 0,
        interrogationResults : "Suspicious",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==3) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            targeted.nightKill();
        }
    },
    Consort: {
        faction : "Mafia",
        alignment : "Support",
        roleblockable : false,
        defense : 0,
        interrogationResults : "Suspicious",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==0) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            targeted.roleBlock();
        }
    },
    Escort: {
        faction : "Town",
        alignment : "Support",
        roleblockable : false,
        defense : 0,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==0) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            targeted.roleBlock();
        }
    },
}