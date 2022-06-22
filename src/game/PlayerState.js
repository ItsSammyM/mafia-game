import { MyRole } from "./MyRole";

export class PlayerState{
    constructor(name)
    {
        this.name = name;
        this.alibi = "";
        this.role = null;
    }
    resetRole(){
        let roleTitle = this.role.roleTitle;
        this.role = new MyRole(roleTitle);
    }
}