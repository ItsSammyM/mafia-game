import { GameManager } from "./GameManager";

export const AllRoles = {
    Sheriff: {
        faction : "Town",
        alignment : "Investigative",
        roleblockable : true,
        witchable : true,
        defense : 0,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==4) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            player.addGiveInformation("Your target was found to be "+AllRoles[targeted.role.roleTitle].interrogationResults,false);
        }
    },
    Lookout: {
        faction : "Town",
        alignment : "Investigative",
        roleblockable : true,
        witchable : true,
        defense : 0,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==4) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            let v = "";
            for(let i = 0 ; i < targeted.role.targetedBy.length; i++){
                v+=targeted.role.targetedBy[i]+", ";
            }
            v = v.substring(0,v.length-2);
            player.addGiveInformation("The visitors to your target were "+v,false);
        }
    },
    Escort: {
        faction : "Town",
        alignment : "Support",
        roleblockable : false,
        witchable : true,
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
    Mafioso: {
        faction : "Mafia",
        alignment : "Killing",
        roleblockable : true,
        witchable : true,
        defense : 0,
        interrogationResults : "Suspicious",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            if(priority!==6) return;

            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);
            targeted.nightKill(player);
        }
    },
    Godfather: {
        faction : "Mafia",
        alignment : "Killing",
        roleblockable : true,
        witchable : true,
        defense : 1,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 1) return;
            let targeted = GameManager.instance.getPlayerFromName(player.role.targeting[0]);

            if(priority===1){
                let mafioso = GameManager.instance.getPlayerByRole("Mafioso");
                if(mafioso !== null) player.role.extra.foundMafioso = true;

                if(player.role.extra.foundMafioso && !mafioso.role.extra.witched && mafioso !== targeted){
                    mafioso.role.targeting = [targeted.name];
                    mafioso.addGiveInformation("The godfather ordered you to attack his target", false);
                    player.role.targeting = [];
                }
            }else if(priority===6 && !player.role.extra.foundMafioso){
                targeted.nightKill(player);
            }            
        }
    },
    Consort: {
        faction : "Mafia",
        alignment : "Support",
        roleblockable : false,
        witchable : true,
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
    Witch: {
        faction : "Neutral",
        alignment : "Evil",
        roleblockable : false,
        witchable : false,
        defense : 1,
        interrogationResults : "Innocent",
        doRole : function(priority, player){
            if(!player.role.alive) return;
            if(player.role.targeting.length < 2) return;

            

            if(priority===-2){
                let controlled = GameManager.instance.getPlayerFromName(player.role.targeting[0]);

                if(AllRoles[controlled.role.roleTitle].witchable){
                    controlled.role.targeting[0] = player.role.targeting[1];
                    controlled.role.extra.witched = true;
                    controlled.addGiveInformation("You were controlled by the witch, your target was changed.", false);
                    player.role.extra.controlled = controlled;
                }
            }
            if(priority===10){
                player.addGiveInformation("Your targets role is "+player.role.extra.controlled.role.roleTitle+"\n here is the information they recieved");
                player.addGiveInformationList(player.role.extra.controlled.giveInformation);
            }

            
            
            //let controlledInto = GameManager.instance.getPlayerFromName(player.role.targeting[1]);

            
            
        }
    }
}