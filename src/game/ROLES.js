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
     * @param {function} _canTargetFunction
     * @param {Array} _astralVisitsList
     */
    constructor(
        _name, _basicDescription, _emoji,
        _advancedDescription, 
        _priorityDescription, 
        _faction, _alignment, _team, 
        _victoryGroup, _maximumCount,
        _defense, _attack, 
        _roleblockable, _witchable, _isSuspicious, 
        _extraPersist, 
        _doRole, 
        _canTargetFunction,
        _astralVisitsList,
        ){
        this.name = _name;
        this.emoji = _emoji;
        this.basicDescription = _basicDescription;

        this.advancedDescription = _advancedDescription;
        this.priorityDescription = _priorityDescription;

        this.faction = _faction;
        this.alignment = _alignment;
        this.team = _team;

        this.victoryGroup = _victoryGroup;
        this.maximumCount = _maximumCount;  //Infinity, 0 is you cant have one. 1 is normal unique

        this.defense=_defense;
        this.attack=_attack;

        this.roleblockable=_roleblockable;
        this.witchable=_witchable;
        this.isSuspicious=_isSuspicious;

        this.extraPersist=_extraPersist;
        this.doRole=_doRole;

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
        this.astralVisitsList = _astralVisitsList;
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
        "What you see isnt always true. A player could look suspicious if they're framed, doused, or other. A Godfather will also look innocent even though they're evil.\n"+
        "Regardless, if you see someone as suspicious, thats alot of information, and you should tell the town immedietly.",
        "4 > Get Results",
        "Town", "Investigative", null,
        "Town", Infinity,
        0, 0,
        true, true, false,
        {},
        (priority, player)=>{
            if(priority !== 4) return;

            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            player.role.addNightInformation(new ChatMessageState(
                null,
                "Your target seems to be " + (myTarget.role.cycle.isSuspicious ? "suspicious." : "innocent."),
                GameManager.COLOR.GAME_TO_YOU
            ), true);
        },
        null,
        null
    ),
    "Lookout":new Role(
        "Lookout", "Target a player to find out who else visited them, (find out who else targeted them)", "🔭",
        "Its often a good idea to choose players who you think will get killed because if they get killed then you will get to know who killed them and can tell the town who the killer was.",
        "4 > Get Results",
        "Town", "Investigative", null, 
        "Town", Infinity,
        0, 0,
        true, true, false,
        {},
        (priority, player)=>{
            if(priority !== 4) return;

            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;
            
            let outString = "";
            for(let visitorIndex in myTarget.role.cycle.targetedBy){
                let visitor = myTarget.role.cycle.targetedBy[visitorIndex];

                outString += visitor.name + ", ";
            }
            outString = outString.substring(0, outString.length-2);

            player.role.addNightInformation(new ChatMessageState(
                null,
                "This is who visited your target: " + outString,
                GameManager.COLOR.GAME_TO_YOU
            ), true);
        },
        null,
        null
    ),
    "Spy":new Role(
        "Spy", "Target a player to bug them and see some messages they recieved. You can see who the mafia vists.", "📻",
        "If it is required for a player to be a specific role to recieve a message, then the spy can't see it using a bug. You cant see astral visits \n"+
        "Seeing mafia visits can let you know if someone is lying about being blackmailed, and figure out what mafia roles there are. \n"+
        "You can also deduce who is mafia based on the fact that mafia usually can't visit themselves.",
        "10 > Get information",
        "Town", "Investigative", null,
        "Town", Infinity,
        0, 0,
        true, true, false,
        {},
        (priority, player)=>{
            if(priority !== 10) return;

            if(!player.role.cycle.aliveNow) return;

            //give mafia visits
            let outString = "The mafia visited these players: ";
            let mafiaVisitedSomeone = false;
            for(let eachPlayerName in GameManager.host.players){
                let eachPlayer = GameManager.host.players[eachPlayerName];

                for(let i in eachPlayer.role.cycle.targetedBy){
                    let visitor = eachPlayer.role.cycle.targetedBy[i];

                    if(visitor.role.getRoleObject().faction === "Mafia"){
                        outString+=eachPlayer.name+", "; mafiaVisitedSomeone=true;
                    }
                }
            }
            if(outString.length > 2) outString = outString.substring(0, outString.length-2);

            if(mafiaVisitedSomeone){
                player.role.addNightInformation(new ChatMessageState(
                    null, outString, GameManager.COLOR.GAME_TO_YOU
                ),true);
            }else{
                player.role.addNightInformation(new ChatMessageState(
                    null, "The mafia didn't visit anyone", GameManager.COLOR.GAME_TO_YOU
                ),true);
            }



            //bug
            if(player.role.cycle.targeting.length < 1) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            for(let i in myTarget.role.cycle.nightInformation){
                let information = myTarget.role.cycle.nightInformation[i];
                //if not role specific
                if(information[1] === false)
                    player.role.addNightInformation(new ChatMessageState(
                        information[0].title,
                        "Targets message: "+information[0].text,
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);
            }
        },
        null,
        null
    ),
    "Veteran":new Role(
        "Veteran", "Target yourself to go on alert and attack everyone who visits you. 3 uses only", "🎖️",
        "Going on alert grants you powerfull(2) defense and all visitors will die, but you can only use it 3 times. Try to get evil people to visit you and then go on alert. However, it is easy to accidentally kill many townies.",
        "-12 > If decide to alert you get defense,\n"+
        "6 > Kill all visitors",
        "Town", "Killing", null,
        "Town", 1,
        0, 2,
        false, false, false,
        {alertsLeft : 3},
        (priority, player)=>{
            
            if(!player.role.cycle.aliveNow) return;

            if(priority === -12){

                if(player.role.cycle.targeting.length < 1) return;
                let myTarget = player.role.cycle.targeting[0];

                if(player !== myTarget && player.role.persist.roleExtra.alertsLeft <= 0) return;

                player.role.persist.roleExtra.alertsLeft--;
                player.role.cycle.extra.isVeteranOnAlert = true;

                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "You went on alert tonight, you now have "+player.role.persist.roleExtra.alertsLeft+" alerts left",
                    GameManager.COLOR.GAME_TO_YOU
                ), true);

                if(player.role.cycle.defense < 2) player.role.cycle.defense = 2;
            
            }else if(priority === 6){
                //kill all visitors
                if(player.role.cycle.extra.isVeteranOnAlert){
                    for(let i in player.role.cycle.targetedBy){
                        player.role.cycle.targetedBy[i].tryNightKill(player, player.role.cycle.attack);

                        player.role.addNightInformation(new ChatMessageState(
                            null,
                            "You attacked someone who visited you",
                            GameManager.COLOR.GAME_TO_YOU
                        ), true);
                    }
                }
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 1 && //im targeting nobody already
                myPlayer.name === otherPlayer.name && //targeting self
                myPlayer.role.persist.roleExtra.alertsLeft > 0
            );
        },
        [true]
    ),
    "Vigilante":new Role(
        "Vigilante", "Target a player to shoot them, if you kill a townie, then you will die the next night.", "🔫",
        "You cant shoot the first night. You can only shoot up to a maximum of 3 times. If you shoot and kill a town member, you will shoot youself the next night. \n"+
        "You cant shoot someone else on the night you shoot yourself. It is a good idea to wait untill your sure someone is evil to shoot. Be weary revealing yourself because if there is a Witch in the game, they can control you and force you to shoot a town member.",
        "-12 > Suicide \n"+
        "6 > Kill",
        "Town", "Killing", null,
        "Town", Infinity,
        0, 1,
        true, true, false,
        {bulletsLeft : 3, didShootTownie: false},
        (priority, player)=>{
            if(!player.role.cycle.aliveNow) return;

            if(priority === -12){
                if(!player.role.persist.roleExtra.didShootTownie) return;
                
                player.tryNightKill(player, 3);

                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "You attempt suicide due to the guilt of killing a town member",
                    GameManager.COLOR.GAME_TO_YOU
                ), true);

            }else if(priority === 6){
                if(GameManager.host.cycleNumber <= 1) return;
                if(player.role.persist.roleExtra.didShootTownie) return;
                if(player.role.cycle.targeting.length < 1) return;
                let myTarget = player.role.cycle.targeting[0];

                if(player === myTarget || player.role.persist.roleExtra.bulletsLeft <= 0) return;
                player.role.persist.roleExtra.bulletsLeft--;

                myTarget.tryNightKill(player, player.role.cycle.attack);
                if(!myTarget.role.persist.alive && myTarget.role.getRoleObject().faction === "Town")
                    player.role.persist.roleExtra.didShootTownie = true;
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 1 &&   //havent already targeted at least 1 person
                GameManager.host.cycleNumber > 1 &&   //its not night 1
                myPlayer.role.persist.roleExtra.bulletsLeft > 0 && //still has bullets left
                !myPlayer.role.persist.roleExtra.didShootTownie
            );
        },
        null
    ),
    "Doctor":new Role(
        "Doctor", "Target a player to save them from an attack, you can save yourself once", "💉",
        "Targeting a player will grant them powerfull defense (2). You will know if they were attacked, but they wont know they've been healed unless theyre attacked.\n"+
        "It is usually a good idea to try to keep yourself hidden becuase you can only save yourself 1 time. Obviously you should try to pick those who would be targets for the mafia",
        "2 > Grant defense,\n"+
        "8 > Tell both players if the doctor saved them",
        "Town", "Protective", null, 
        "Town", Infinity,
        0, 0,
        true, true, false,
        {selfHealed : false},
        (priority, player)=>{
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            if(player.role.persist.roleExtra.selfHealed && player === myTarget) return; //if already self healed and trying it again

            if(priority === 2){
                if(player === myTarget) player.role.persist.roleExtra.selfHealed=true;

                if(myTarget.role.cycle.defense < 2){
                    myTarget.role.cycle.defense=2;
                }
                myTarget.role.cycle.extra.healedByDoc = true;
            }
            if(priority === 8){
                if(myTarget.role.cycle.extra.healedByDoc && myTarget.role.cycle.extra.attackedTonight){
                    player.role.addNightInformation(new ChatMessageState(
                        null,
                        "You healed your target",
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);
                    myTarget.role.addNightInformation(new ChatMessageState(null, "You were healed by a Doctor", GameManager.COLOR.GAME_TO_YOU), false);
                }
            }
            
        },
        (myPlayer, otherPlayer)=>{
            
            return (
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 1 && //im targeting nobody already
                (
                    (myPlayer.name===otherPlayer.name && !myPlayer.role.persist.roleExtra.selfHealed) || //self healing
                    myPlayer.name!==otherPlayer.name //healing someone else
                ) 
            );
        },
        null
    ),
    "Mayor":new Role(
        "Mayor", "Reveal any time during the day, from that moment forward you will get 3 times the voting power", "🏛️",
        "You can't do anyhting during night, but revealing will confirm to everyone what your role is without question.",
        "No night ability",
        "Town", "Support", null, 
        "Town", 0,  //this should be 1
        0, 0,
        true, true, false,
        {revealed : false},
        (priority, player)=>{

        },
        (myPlayer, otherPlayer)=>{
            return false;
        },
        null
    ),
    "Escort":new Role(
        "Escort", "Target a player to roleblock them, they cannot use their role for that night", "💋",
        "People will know if they have been roleblocked. A good idea is to roleblock those you think are evil, if no one dies in the night, you may have roleblocked a killer",
        "-6 > Roleblock the person",
        "Town", "Support", null, 
        "Town", Infinity,
        0, 0,
        false, true, false, 
        {},
        (priority, player)=>{
            if(priority !== -6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            myTarget.roleblock();
        },
        null,
        null
    ),
    "Transporter":new Role(
        "Transporter", "Target 2 players to swap them. Everyone that wants to target one person will instead target the other", "🔄",
        "People will know if they were transported and the order of your targets doesn't matter. The ability will only work if you targeted 2 people.\n"+
        " Try to swap people who might be killed tonight with people you think are evil. This way the killers will accidentally kill themselves.",
        "-10 > Swap",
        "Town", "Support", null,
        "Town", Infinity,
        0, 0,
        false, false, false,
        {},
        (priority, player)=>{
            if(priority !== -10) return;
            if(player.role.cycle.targeting.length < 2) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget1 = player.role.cycle.targeting[0];
            let myTarget2 = player.role.cycle.targeting[1];

            if(!myTarget1.role.cycle.aliveNow) return;
            if(!myTarget2.role.cycle.aliveNow) return;

            myTarget1.role.addNightInformation(new ChatMessageState(
                null,
                "You were transported",
                GameManager.COLOR.GAME_TO_YOU
            ), false);
            myTarget2.role.addNightInformation(new ChatMessageState(
                null,
                "You were transported",
                GameManager.COLOR.GAME_TO_YOU
            ), false);

            for(let otherPlayerName in GameManager.host.players){
                let otherPlayer = GameManager.host.players[otherPlayerName];

                if(otherPlayer === player) continue;

                for(let i in otherPlayer.role.cycle.targeting){

                    switch(otherPlayer.role.cycle.targeting[i]){
                        case myTarget1:
                            otherPlayer.role.cycle.targeting[i] = myTarget2;
                            break;
                        case myTarget2:
                            otherPlayer.role.cycle.targeting[i] = myTarget2;
                            break;
                        default:
                            break;
                    }
                }
                
            }
        },
        (myPlayer, otherPlayer)=>{

            return (
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 2 &&   //havent already targeted at least 2 person
                (myPlayer.role.cycle.targeting[0] !== otherPlayer)
            );
        },
        null
    ),
    //#endregion
    //#region Mafia
    "Godfather":new Role(
        "Godfather", "Target a player to kill them. If there is a mafioso, they will do whatever kill you commanded them to do", "👴",
        "If theres is a mafioso in the game. Your visit will be an astral visit. And the mafioso will instead do the killing. Otherwise you will do the killing.\n"+
        "Because the mafioso does the killing, you appear as innocent, and you have defense, you might have an easier time decieving the town and pretending to be a townie.",
        "-4 > Direct mafioso and clear yourself,\n"+
        "6 > if theres no mafioso, you kill",
        "Mafia", "Killing", "Mafia",
        "Mafia", 1,
        1, 1,
        true, true, false,
        {},
        (priority, player)=>{
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            if(priority === -4){
                //find mafisoso (or more if there are for some reason)
                for(let mafiosoName in GameManager.host.players){
                    if(GameManager.host.players[mafiosoName].role.persist.roleName === "Mafioso"){

                            //change mafioso target
                        GameManager.host.players[mafiosoName].role.cycle.targeting = [myTarget];
                            //clear myself
                        player.role.cycle.targeting=[];
                    }
                        
                }
            }else if(priority === 6){
                myTarget.tryNightKill(player, player.role.cycle.attack);
            }
        },
        null,
        null
    ),
    "Mafioso":new Role(
        "Mafioso", "Target a player to kill them, the godfathers choice could override yours", "🌹",
        "You do the killing. Whoever you pick will die. If theres a godfather, they can force you to kill a different person.\n"+
        "If your target has defense and they are not killed. They are likely to be a neutral role, you should tell the mafia this and decide what to do. However they could also have been protected by a doctor or other.",
        "6 > Kill",
        "Mafia", "Killing", "Mafia", 
        "Mafia", 1,
        0, 1,
        true, true, true,
        {},
        (priority, player)=>{
            if(priority !== 6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            myTarget.tryNightKill(player, player.role.cycle.attack);
        },
        null,
        null
    ),
    "Consort":new Role(
        "Consort", "Target a player to roleblock them, they cannot use their role for that night", "💄",
        "People will know if they have been roleblocked. Your role works very similarly to the Escort, making claiming escort very easy, but people know that you could be a consort.\n"+
        " You should roleblock any town member deemed a threat. Especially Vigilantes if you know theyre going to shoot a mafia memeber.",
        "-6 > Roleblock the person",
        "Mafia", "Support", "Mafia", 
        "Mafia", Infinity,
        0, 0,
        false, true, true, 
        {},
        (priority, player)=>{
            if(priority !== -6) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            myTarget.roleblock();
        },
        null,
        null
    ),
    "Blackmailer":new Role(
        "Blackmailer", "Target a player to blackmail them, they cannot speak for the whole next day.", "🤐",
        "You can read peoples whispers. You should try to target people who are most likely going to say something important the next day. Town Investigative roles often are huge targets for blackmailers.",
        "2 > Silence",
        "Mafia", "Support", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, true, true,
        {},
        (priority, player)=>{
            if(priority!==2) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            myTarget.role.cycle.extra.blackmailed = true;
            myTarget.role.addNightInformation(new ChatMessageState(
                "BLACKMAILED",
                "You were blackmailed. Do not under any circumstances speak during the next day. You can not write in chat. You can still vote.",
                GameManager.COLOR.GAME_TO_YOU
            ), false);
        },
        null,
        null
    ),
    "Janitor":new Role(
        "Janitor", "Target a player who might die tonight, if they do, their role and will will appear to be cleaned. You have 3 uses.", "🧹",
        "A clean means the town wont know what their role was, but you still will. This makes it easy for you to pretend to be what they were. You should tell the other mafia members what the dead players role was.",
        "8 > clean",
        "Mafia", "Deception", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, true, true,
        {cleansLeft : 3},
        (priority, player)=>{
            if(priority !== 8) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;
            if(player.role.persist.roleExtra.cleansLeft <= 0) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            player.role.persist.roleExtra.cleansLeft--;

            
            myTarget.role.cycle.shownRoleName = "Cleaned";
            myTarget.role.cycle.shownWill = "Cleaned";
            if(!myTarget.role.persist.alive){
                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets role was "+myTarget.role.persist.roleName,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets will was :"+myTarget.role.persist.will,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
        },
        (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return(
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.role.cycle.targeting.length < 1 &&   //havent already targeted at least 1 person
                myPlayer.role.persist.roleExtra.cleansLeft > 0  //has cleans left
            );
        },
        null
    ),
    "Forger":new Role(
        "Forger", "Target a player who might die tonight, if they do, their role and will will appear to be what you decided. You have 2 uses.", "🖋️",
        "To decide your targets role and will you must use your notepad. The notepad should include an all capital letter name of a role and then the forged will. Everything after the capital role name will be included in the forged will.\n"+
        "After a forge, you get to know what your targets real role and will was. You should try to forge wills to make them look realistic and help mafia. Beware of what the player has said and how they acted during the whole game and keep in mind a medium will know if you forged someone.",
        "8 > Change appeared role and will",
        "Mafia", "Deception", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, true, true,
        {forgesLeft : 2},
        (priority, player)=>{
            if(priority !== 8) return;
            if(player.role.cycle.targeting.length < 1) return;
            if(!player.role.cycle.aliveNow) return;
            if(player.role.persist.roleExtra.forgesLeft <= 0) return;

            let myTarget = player.role.cycle.targeting[0];
            if(!myTarget.role.cycle.aliveNow) return;

            player.role.persist.roleExtra.forgesLeft--;

            //find what shownRoleName should be changed to
            let roleNameIndex = Infinity;
            let foundShownRoleName = null;
            let foundShownWill = null;

            //find lowest index that a roleName appears at
            for(let roleName in ROLES){
                let capitalRoleName = roleName.toLocaleUpperCase();
                let index = player.role.cycle.shownNote.indexOf(capitalRoleName);

                if(roleNameIndex > index && index!==-1){
                    roleNameIndex = index;
                    foundShownRoleName = roleName;
                }
            }
            //remove the rolename from the notepad to get the will
            if(roleNameIndex!==Infinity){
                //remove roleName from will
                foundShownWill = player.role.cycle.shownNote.substring(roleNameIndex+foundShownRoleName.length, player.role.cycle.shownNote.length).trim();

                //actually change everything
                myTarget.role.cycle.shownRoleName = foundShownRoleName?foundShownRoleName:"Incomprehensible";
                myTarget.role.cycle.shownWill = foundShownWill?foundShownWill:"";
            }

            if(!myTarget.role.persist.alive){
                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets real role was "+myTarget.role.persist.roleName,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets real will was :"+myTarget.role.persist.will,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
        },
        (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return(
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.role.cycle.targeting.length < 1 &&   //havent already targeted at least 1 person
                myPlayer.role.persist.roleExtra.forgesLeft > 0  //has forges left
            );
        },
        null
    ),
    //#endregion
    //#region Neutral
    "Witch":new Role(
        "Witch", "Target 2 players, the first one will be forced to target the second one", "🧙‍♀️",
        "The first persons target will be changed to be your second target. Your ability wont work if the first target is witch immune. Your second target is an astral visit.\n"+
        " You have a sheild that grants you basic defense(1), this sheild dissapears after you were attacked, even if you were saved by a protective role. Because you win with any team that isnt town, You should try your best to find out who else is evil and get them to work with you.",
        "-8 > Controll target and tell show that they were controlled,\n"+
        "12 > steal their information",
        "Neutral", "Evil", null,
        null, Infinity,
        0, 0,
        false, false, false,
        {hasSheild : true},
        (priority, player)=>{
            if(priority === -8){
                //give witch sheild
                if(player.role.cycle.defense < 1 && player.role.persist.roleExtra.hasSheild)
                    player.role.cycle.defense = 1;
            
                if(player.role.cycle.targeting.length < 2) return;
                if(!player.role.cycle.aliveNow) return;

                let myTarget1 = player.role.cycle.targeting[0];
                let myTarget2 = player.role.cycle.targeting[1];

                if(!myTarget1.role.cycle.aliveNow) return;
                if(!myTarget2.role.cycle.aliveNow) return;

                if(!myTarget1.role.getRoleObject().witchable){

                    player.role.addNightInformation(new ChatMessageState(
                        null,
                        "Your target was immune to being controlled",
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);

                    myTarget1.role.addNightInformation(new ChatMessageState(
                        null,
                        "A witch tried to control you but you are immune",
                        GameManager.COLOR.GAME_TO_YOU
                    ), false);
                    return;
                }

                myTarget1.role.addNightInformation(new ChatMessageState(
                    null,
                    "You were controlled by a witch",
                    GameManager.COLOR.GAME_TO_YOU
                ), false);
                myTarget1.role.cycle.targeting = [myTarget2];
                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "Your first targets role was "+myTarget1.role.persist.roleName,
                    GameManager.COLOR.GAME_TO_YOU),
                    true
                );
            }
            else if(priority === 12){
                if(player.role.cycle.targeting.length < 2) return;
                let myTarget1 = player.role.cycle.targeting[0];
                
                //steal information
                for(let i in myTarget1.role.cycle.nightInformation){
                    player.role.addNightInformation(
                        new ChatMessageState(
                            myTarget1.role.cycle.nightInformation[i][0].title,
                            "Targets message: "+myTarget1.role.cycle.nightInformation[i][0].text,
                            GameManager.COLOR.GAME_TO_YOU
                        ),
                        myTarget1.role.cycle.nightInformation[i][1]
                    );
                }
                
                //remove sheild
                if(player.role.cycle.extra.attackedTonight)
                    player.role.persist.roleExtra.hasSheild = false;
            }

        },
        (myPlayer, otherPlayer)=>{
            return (
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                myPlayer.role.cycle.targeting.length < 2 &&   //havent already targeted at least 2 person
                (
                    (myPlayer.role.cycle.targeting.length === 0 && myPlayer !== otherPlayer) ||
                    (myPlayer.role.cycle.targeting.length === 1)
                )
            );
        },
        [false, true]
    ),
    "Arsonist":new Role(
        "Arsonist", "Target a player to douse them in gasoline, target yourself to ignite and kill all doused players.", "🔥",
        "If there is another arsonist, you will also ignite the people they doused. Doused players appear as an arsonist to investigative roles. You get to know who visits you at night. If you target nobody, you will clean gasoline off yourself. \n"+
        "Try to douse people you think will stay alive till late game, so you when you ignite, all the doused players arent already dead. This means dousing quiet people. Try to stay hidden, as you pose a large threat to the town and the mafia",
        "-12 > clean gas off yourself, \n"+
        "2 > Douse and douse visitors, \n"+
        "6 > Ignition",
        "Neutral", "Killing", null,
        "Arsonist", Infinity,
        1, 3, 
        false, true, false, //fix roleblock stuff later
        {},
        (priority, player)=>{
            if(!player.role.cycle.aliveNow) return;
            
            if(priority === -12){   //clean gas
                
                if(player.role.cycle.targeting.length > 0) return;
                if(player.role.persist.extra.doused)
                    player.role.addNightInformation(new ChatMessageState(
                        null,
                        "You cleaned the gas off yourself",
                        GameManager.COLOR.GAME_TO_YOU),
                        true
                    );
                player.role.persist.extra.doused = false;
            }
            if(priority === 2){ //douse

                //visit douse
                for(let i in player.role.cycle.targetedBy){
                    if(player.role.cycle.targetedBy[i] === player) continue;

                    player.role.addNightInformation(new ChatMessageState(
                        null,
                        "You doused a visitor named "+player.role.cycle.targetedBy[i].name,
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);
                    
                    player.role.cycle.targetedBy[i].role.persist.extra.doused = true;
                }

                //regular douse
                if(player.role.cycle.targeting.length < 1) return;
                let myTarget = player.role.cycle.targeting[0];

                if(player.role.cycle.targeting[0] === player) return;
                if(!myTarget.role.cycle.aliveNow) return;

                myTarget.role.persist.extra.doused = true;

                player.role.addNightInformation(new ChatMessageState(
                    null,
                    "You doused "+myTarget.name,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
            else if(priority === 6){    //ignite
                if(player.role.cycle.targeting.length < 1) return;
                let myTarget = player.role.cycle.targeting[0];

                if(myTarget !== player) return;

                for(let playerName in GameManager.host.players){
                    let dousedPlayer = GameManager.host.players[playerName];
                    if(dousedPlayer.role.persist.extra.doused)
                        dousedPlayer.tryNightKill(player, player.role.cycle.attack);
                }
            }

        },
        (myPlayer, otherPlayer)=>{
            return (
                //myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.role.persist.alive && //theyre alive
                myPlayer.role.persist.alive && //im alive
                //!otherInMyTeam && //not on same team
                myPlayer.role.cycle.targeting.length < 1    //havent already targeted at least 1 person
            );
        },
        null
    ),
    //#endregion
}

/*
Priority
Everyones target is set first

-12: Veteran(Decides Alert) Vigilante(Suicide) Jester(Kill) Arsonist(Clean self)
-10: Transporter(Swaps)
-8: Witch(Swaps, Activate sheild)
-6: Escort / Consort(Roleblock)
-4 Godfather(Swap mafioso target and clear self)
-2 bodyguard(swap)
 0: visits happen here
+2: Doctor(Heal), Blackmailer(Decide), Crusader(Heal), Arsonist(Douse), Framer, Disguiser
+4: Sheriff, Invest, Consig, Lookout, Tracker, Arsonist(Find who visited)
+6: Mafioso/Godfather, SerialKiller, Werewolf, Veteran, Vampire, Arsonist, Crusader, Bodyguard, Vigilante (All kill)
+8: Amnesiac(Convert) Vampire(Convert) Forger(Change info), Janitor(Clean & info), Doctor(Notify)
+10 Spy(Collect info)
+12 Witch(Steal info & Remove sheild)

--------
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

