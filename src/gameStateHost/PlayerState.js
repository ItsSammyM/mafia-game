import { ROLES } from "../game/ROLES";

export class PlayerState{
    constructor(name){
        this.name = name;
        this.role = null;
    }
    createPlayerRole(exact){
        this.role = new PlayerRole(exact);
    }
}
export class PlayerRole{
    constructor(_roleName){
        let roleObject = ROLES[_roleName];

        this.setPersist(roleObject);
        this.setCycle(roleObject);
    }
    setPersist(roleObject){
        this.persist = {
            alive : true,
            roleName : roleObject.name,
            extra: {
                // doused : false,
                // framed : false,
                // revealed : false,
                // selfHealed : false,
                // cantTarget : []
            }
        };
        //copy extra persist over from role
        for(let key in roleObject.persist){
            this.persist[key] = roleObject.persist[key];
        }
    }
    setCycle(roleObject){
        this.cycle = {
            votedBy: [],
            voting: [],

            targetedBy : [],
            targeting : [],

            roleBlocked : false,
            aliveNow : this.persist.alive,

            defense : roleObject.defense,
            isSuspicious : roleObject.isSuspicious,

            extra : {

            }
        }
    }
}
/*
this.name = _name;

this.faction = _faction;
this.alignment = _alignment;

this.defense=_defense;

this.roleblockable=_roleblockable;
this.witchable=_witchable;

this.isSuspicious=_isSuspicious;

this.extraPersist=_extraPersist;
this.doRole=_doRole;
*/