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
-5
-4 
-3: Transporter
-2: Vampire(convert)
-1: Disguiser
0: Sheriff
1: Mafioso
2
3
4
5




*/