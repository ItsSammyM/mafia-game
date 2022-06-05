export class Player
{
    constructor(name)
    {
        this.name = name;
        this.state = new PlayerState();
    }
}
class PlayerState{
    constructor()
    {
        this.alive = false;
        this.will = new Will();
        this.role = "None";
    }
}
class Will{
    constructor()
    {
        this.will = "No Will";
        this.postedWill = "No Will";
    }
}
class Role{
    constructor()
    {
        this.title = "None";
        this.faction = "Neutral";
        this.alignment = "Neutral";

        this.priority = 0;
        this.defense = 0;
        this.attack = 0;
    }
}