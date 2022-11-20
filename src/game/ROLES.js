import { ChatMessageState } from "../gameStateHost/ChatMessageState";
import { shuffledList } from "./functions";
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
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alives
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1    //havent already targeted at least 1 person
            );
        };
        this.astralVisitsList = _astralVisitsList;
    }
    static onSameTeam(playerA, playerB){
        return playerA.getRoleObject().team === playerB.getRoleObject().team && //same team
        playerA.getRoleObject().team!==null;  //not null
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

            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            player.addNightInformation(new ChatMessageState(
                null,
                "Your target seems to be " + (myTarget.cycleVariables.disguisedAsTonight.value.cycleVariables.isSuspiciousTonight.value ? "suspicious." : "innocent."),
                GameManager.COLOR.GAME_TO_YOU
            ), true);
        },
        null,
        null
    ),
    "Lookout":new Role(
        "Lookout", "Target a player to find out who else visited them, (find out who else targeted them)", "🔭",
        "Its often a good idea to choose players who you think will get killed because if they get killed then you will get to know who killed them and can tell the town who the killer was.",
        "4 > Get results",
        "Town", "Investigative", null, 
        "Town", Infinity,
        0, 0,
        true, true, false,
        {},
        (priority, player)=>{
            if(priority !== 4) return;

            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;
            
            let outString = "";
            for(let visitorIndex in myTarget.cycleVariables.targetedBy.value){
                let visitor = myTarget.cycleVariables.targetedBy.value[visitorIndex];

                outString += visitor.cycleVariables.disguisedAsTonight.value.name + ", ";
            }
            outString = outString.substring(0, outString.length-2);

            player.addNightInformation(new ChatMessageState(
                null,
                "This is who visited your target: " + outString,
                GameManager.COLOR.GAME_TO_YOU
            ), true);
        },
        null,
        null
    ),
    "Investigator":new Role(
        "Investigator", "Target a player to get a clue to what their role is.", "🔍",
        "All possible investigative results are listed in the wiki. It is often a good idea to get people to claim before you reveal that you investigated them, this way people are more likely to admit guilt.",
        "4 > Get results",
        "Town", "Investigative", null,
        "Town", Infinity,
        0, 0,
        true, true, false,
        {},
        (priority, player)=>{
            if(priority !== 4) return;

            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;
            
            let outString = "";
            let foundResult = false;
            //find what list to use
            for(let investigativeResultIndex in GameManager.host.investigativeResults){
                let investigativeResult = GameManager.host.investigativeResults[investigativeResultIndex];

                if(investigativeResult.includes(
                    myTarget.cycleVariables.disguisedAsTonight.
                    value.cycleVariables.investigativeResultTonight.value)){
                    //found result
                    
                    //now loop through result and add them to list
                    let investigativeResult = GameManager.host.investigativeResults[investigativeResultIndex];
                    investigativeResult = shuffledList(investigativeResult);
                    
                    for(let roleNameIndex in investigativeResult){
                        foundResult = true;
                        outString += investigativeResult[roleNameIndex]+", ";
                    }
                    break;
                }
                
            }
            if(foundResult && outString.length>2){
                outString = outString.substring(0, outString.length-2);
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your target could be one of these roles: " + outString,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
            if(!foundResult)
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your target is: " + myTarget.cycleVariables.disguisedAsTonight.value.roleName,
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

            if(!player.cycleVariables.aliveTonight.value) return;

            //give mafia visits
            let outString = "The mafia visited these players: ";
            let mafiaVisitedSomeone = false;
            for(let eachPlayerName in GameManager.host.players){
                let eachPlayer = GameManager.host.players[eachPlayerName];

                for(let i in eachPlayer.cycleVariables.targetedBy.value){
                    let visitor = eachPlayer.cycleVariables.targetedBy.value[i];

                    if(visitor.getRoleObject().faction === "Mafia"){
                        outString+=eachPlayer.name+", "; mafiaVisitedSomeone=true;
                    }
                }
            }
            if(outString.length > 2) outString = outString.substring(0, outString.length-2);

            if(mafiaVisitedSomeone){
                player.addNightInformation(new ChatMessageState(
                    null, outString, GameManager.COLOR.GAME_TO_YOU
                ),true);
            }else{
                player.addNightInformation(new ChatMessageState(
                    null, "The mafia didn't visit anyone", GameManager.COLOR.GAME_TO_YOU
                ),true);
            }



            //bug
            if(player.cycleVariables.targeting.value.length !== 1) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            for(let i in myTarget.cycleVariables.nightInformation.value){
                let information = myTarget.cycleVariables.nightInformation.value[i];
                //if not role specific
                if(information[1] === false)
                    player.addNightInformation(new ChatMessageState(
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
            
            if(!player.cycleVariables.aliveTonight.value) return;

            if(priority === -12){

                if(player.cycleVariables.targeting.value.length !== 1) return;
                let myTarget = player.cycleVariables.targeting.value[0];

                if(player !== myTarget && player.roleExtra.alertsLeft <= 0) return;

                player.roleExtra.alertsLeft--;
                player.cycleVariables.extra.value.isVeteranOnAlert = true;

                player.addNightInformation(new ChatMessageState(
                    null,
                    "You went on alert tonight, you now have "+player.roleExtra.alertsLeft+" alerts left",
                    GameManager.COLOR.GAME_TO_YOU
                ), true);

                if(player.cycleVariables.defenseTonight.value < 2) player.cycleVariables.defenseTonight.value = 2;
            
            }else if(priority === 6){
                //kill all visitors
                if(player.cycleVariables.extra.value.isVeteranOnAlert){
                    for(let i in player.cycleVariables.targetedBy.value){
                        player.cycleVariables.targetedBy.value[i].tryNightKill(player, player.cycleVariables.attackTonight.value);

                        player.addNightInformation(new ChatMessageState(
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
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 1 && //im targeting nobody already
                myPlayer.name === otherPlayer.name && //targeting self
                myPlayer.roleExtra.alertsLeft > 0
            );
        },
        [true]
    ),
    "Vigilante":new Role(
        "Vigilante", "Target a player to shoot them, if you kill a townie, then you will die the next night. You can't shoot night 1, because why would you?", "🔫",
        "You cant shoot the first night. You can only shoot up to a maximum of 3 times. If you shoot and kill a town member, you will shoot youself the next night. \n"+
        "You cant shoot someone else on the night you shoot yourself. It is a good idea to wait untill your sure someone is evil to shoot. Be weary revealing yourself because if there is a Witch in the game, they can control you and force you to shoot a town member.",
        "-12 > Suicide, \n"+
        "6 > Kill",
        "Town", "Killing", null,
        "Town", Infinity,
        0, 1,
        true, true, false,
        {bulletsLeft : 3, didShootTownie: false},
        (priority, player)=>{
            if(!player.cycleVariables.aliveTonight.value) return;

            if(priority === -12){
                if(!player.roleExtra.didShootTownie) return;
                
                player.tryNightKill(player, 3);

                player.addNightInformation(new ChatMessageState(
                    null,
                    "You attempt suicide due to the guilt of killing a town member",
                    GameManager.COLOR.GAME_TO_YOU
                ), true);

            }else if(priority === 6){
                if(GameManager.host.cycleNumber <= 1) return;
                if(player.roleExtra.didShootTownie) return;
                if(player.cycleVariables.targeting.value.length !== 1) return;
                let myTarget = player.cycleVariables.targeting.value[0];

                if(player === myTarget || player.roleExtra.bulletsLeft <= 0) return;
                player.roleExtra.bulletsLeft--;

                myTarget.tryNightKill(player, player.cycleVariables.attackTonight.value);
                if(!myTarget.alive && myTarget.getRoleObject().faction === "Town")
                    player.roleExtra.didShootTownie = true;
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 1 &&   //i havent already targeted at least 1 person
                GameManager.host.cycleNumber > 1 &&   //its not night 1
                myPlayer.roleExtra.bulletsLeft > 0 && //still has bullets left
                !myPlayer.roleExtra.didShootTownie  //didnt shoot a townie
            );
        },
        null
    ),
    "Doctor":new Role(
        "Doctor", "Target a player to save them from an attack, you can save yourself once", "💉",
        "Targeting a player will grant them powerfull(2) defense. You will know if they were attacked, but they wont know they've been healed unless theyre attacked.\n"+
        "It is usually a good idea to try to keep yourself hidden becuase you can only save yourself 1 time. Obviously you should try to pick those who would be targets for the mafia",
        "2 > Grant defense,\n"+
        "8 > Tell both players if the doctor saved them",
        "Town", "Protective", null, 
        "Town", Infinity,
        0, 0,
        true, true, false,
        {selfHealed : false},
        (priority, player)=>{
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            if(player.roleExtra.selfHealed && player === myTarget) return; //if already self healed and trying it again

            if(priority === 2){
                if(player === myTarget) player.roleExtra.selfHealed=true;

                if(myTarget.cycleVariables.defenseTonight.value < 2){
                    myTarget.cycleVariables.defenseTonight.value=2;
                }
                myTarget.cycleVariables.extra.value.healedByDoc = true;
            }
            else if(priority === 8){
                if(myTarget.cycleVariables.extra.value.healedByDoc && myTarget.cycleVariables.extra.value.attackedTonight){
                    player.addNightInformation(new ChatMessageState(
                        null,
                        "You healed your target",
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);
                    myTarget.addNightInformation(new ChatMessageState(null, "You were healed by a Doctor", GameManager.COLOR.GAME_TO_YOU), false);
                }
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 1 && //im targeting nobody already
                (
                    (myPlayer.name===otherPlayer.name && !myPlayer.roleExtra.selfHealed) || //self healing
                    myPlayer.name!==otherPlayer.name //healing someone else
                ) 
            );
        },
        null
    ),
    "Bodyguard":new Role(
        "Bodyguard", "Target a player to redirect attacks from them to you and attack them back, you can sheild yourself once", "👮🏿",
        "This redirects killing roles. Every role that has 'Killing' alignment will be redirected towards you and you will attack them. When you use your self sheild. You will be granted powerfull(2) defense. You can't protect another bodyguard.",
        "-2 > redirect killer,\n"+
        "2 > grant self vest,\n"+
        "8 > tell both players that an attack was redirected,",
        "Town", "Protective", null,
        "Town", Infinity,
        0, 2,   //should have attack
        true, true, false,
        {vestsLeft : 1},
        (priority, player)=>{
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            if(player.roleExtra.vestsLeft <= 0 && player === myTarget) return; //if already self healed and trying it again

            if(priority===-2){
                if(player===myTarget) return;
                if(myTarget.getRoleObject().name === "Bodyguard") return;
                
                for(let attackerName in GameManager.host.players){
                    let attacker = GameManager.host.players[attackerName];
                    if(attacker.getRoleObject().alignment!=="Killing") continue;

                    let attackRedirected = false;

                    for(let i in attacker.cycleVariables.targeting.value){
                        let attackersTarget = attacker.cycleVariables.targeting.value[i];
                        if(attackersTarget === myTarget){
                            myTarget.cycleVariables.extra.value.protectedByBodyguard = true;
                            attackRedirected = true;
                            attacker.cycleVariables.targeting.value[i] = player;
                        }
                    }

                    if(attackRedirected)
                        attacker.tryNightKill(player, player.cycleVariables.attackTonight.value);
                }
                
            }else if(priority===2){
                if(player!==myTarget) return;

                player.roleExtra.vestsLeft--;

                if(player.cycleVariables.defenseTonight.value < 2){
                    player.cycleVariables.defenseTonight.value = 2;
                }
            }else if(priority===8){
                if(!myTarget.cycleVariables.extra.value.protectedByBodyguard) return;

                player.addNightInformation(new ChatMessageState(
                    null,
                    "You redirected an attack from your target",
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
                myTarget.addNightInformation(new ChatMessageState(null, "A Bodyguard redirected an attack off you.", GameManager.COLOR.GAME_TO_YOU), false);
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 1 && //im targeting nobody already
                (
                    (myPlayer.name===otherPlayer.name && myPlayer.roleExtra.vestsLeft > 0) || //self healing
                    myPlayer.name!==otherPlayer.name //healing someone else
                ) 
            );
        },
        null,
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
    "Medium":new Role(
        "Medium", "You can talk with the dead during the night. After you die, you can seance one living person.", "🔮",
        "You can only speak with the dead during the night so try to get as much information as possible during the night. After you die, you can use your seance ability one time to chat with a lviing player during the night. \n"+
        "Its good to write down quotes from dead players so you can use them when trying to proove your innocence. Remember your simply a medium for the dead to speak with the living.",
        "No night ability. Exept seance.",
        "Town", "Support", null,
        "Town", Infinity,
        0, 0,
        true, true, false,
        {seancesLeft : 1},
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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            myTarget.roleblock();
        },
        null,
        null
    ),
    "Transporter":new Role(
        "Transporter", "Target 2 players to swap them. Everyone that wants to target one person will instead target the other", "🚕",
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
            if(player.cycleVariables.targeting.value.length !== 2) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget1 = player.cycleVariables.targeting.value[0];
            let myTarget2 = player.cycleVariables.targeting.value[1];

            if(!myTarget1.cycleVariables.aliveTonight.value) return;
            if(!myTarget2.cycleVariables.aliveTonight.value) return;

            myTarget1.addNightInformation(new ChatMessageState(
                null,
                "You were transported",
                GameManager.COLOR.GAME_TO_YOU
            ), false);
            myTarget2.addNightInformation(new ChatMessageState(
                null,
                "You were transported",
                GameManager.COLOR.GAME_TO_YOU
            ), false);

            for(let otherPlayerName in GameManager.host.players){
                let otherPlayer = GameManager.host.players[otherPlayerName];

                if(otherPlayer === player) continue;

                for(let i in otherPlayer.cycleVariables.targeting.value){

                    switch(otherPlayer.cycleVariables.targeting.value[i]){
                        case myTarget1:
                            otherPlayer.cycleVariables.targeting.value[i] = myTarget2;
                            break;
                        case myTarget2:
                            otherPlayer.cycleVariables.targeting.value[i] = myTarget2;
                            break;
                        default:
                            break;
                    }
                }
                
            }
        },
        (myPlayer, otherPlayer)=>{

            return (
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 2 &&   //havent already targeted at least 2 person
                (myPlayer.cycleVariables.targeting.value[0] !== otherPlayer)
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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            if(priority === -4){
                //find mafisoso (or more if there are for some reason)
                for(let mafiosoName in GameManager.host.players){
                    if(GameManager.host.players[mafiosoName].roleName === "Mafioso"){

                            //change mafioso target
                        GameManager.host.players[mafiosoName].cycleVariables.targeting.value = [myTarget];
                            //clear myself
                        player.cycleVariables.targeting.value=[];
                            //tell godfather what they have done
                        player.addNightInformation(new ChatMessageState(
                            null,
                            "You forced a mafioso to target your target",
                            GameManager.COLOR.GAME_TO_YOU
                        ), true);
                    }
                        
                }
            }else if(priority === 6){
                myTarget.tryNightKill(player, player.cycleVariables.attackTonight.value);
            }
        },
        null,
        null
    ),
    "Mafioso":new Role(
        "Mafioso", "Target a player to kill them, the godfathers choice could override yours", "🌹",
        "You do the killing. Whoever you pick will die. If theres a godfather, they can force you to kill a different person.\n"+
        "If your target has defense and they are not killed. They are likely to be a neutral role, you should tell the mafia this and decide what to do. However they could also have been protected by a protective role.",
        "6 > Kill",
        "Mafia", "Killing", "Mafia", 
        "Mafia", 1,
        0, 1,
        true, true, true,
        {},
        (priority, player)=>{
            if(priority !== 6) return;
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            myTarget.tryNightKill(player, player.cycleVariables.attackTonight.value);
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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            myTarget.cycleVariables.extra.value.blackmailed = true;
            myTarget.addNightInformation(new ChatMessageState(
                "BLACKMAILED",
                "You were blackmailed. Do not under any circumstances speak during the next day. You can not write in chat. You can still vote.",
                GameManager.COLOR.GAME_TO_YOU
            ), false);
        },
        null,
        null
    ),
    "Consigliere":new Role(
        "Consigliere", "Target a player to find out exactly what their role is.", "🧐",
        "You get to know your targets exact role. Faking investigator is easy, make sure you check the investigator results so you can lie about what you saw a person as. Just beware of spies",
        "4 > Know",
        "Mafia", "Support", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, true, true,
        {},
        (priority, player)=>{
            if(priority!==4) return;
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            player.addNightInformation(new ChatMessageState(
                null,
                "Your targets role was "+myTarget.cycleVariables.investigativeResultTonight.value,
                GameManager.COLOR.GAME_TO_YOU
            ), true);
        },
        null,
        null
    ),
    "Framer":new Role(
        "Framer", "Target a player to frame them. They will look suspicious to certain investigative roles. If you target yourself instead, you will frame everyone who visits you.", "🖼️",
        "Advanced later",
        "2 > Frame,",
        "Mafia", "Deception", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, true, true,
        {},
        (priority, player)=>{
            if(priority!==2) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            if(player.cycleVariables.targeting.value.length !== 1) return;
            let myTarget = player.cycleVariables.targeting.value[0];

            if(!myTarget.cycleVariables.aliveTonight.value) return;

            if(player===myTarget){
                //frame all visitors
                let outString = "";
                for(let i in player.cycleVariables.targetedBy.value){
                    let visitor = player.cycleVariables.targetedBy.value[i];

                    visitor.extra.framed = true;
                    visitor.cycleVariables.isSuspiciousTonight.value = true;
                    visitor.cycleVariables.investigativeResultTonight.value = "Framer";

                    outString+=visitor.name+", ";
                }
                outString = outString.substring(0, outString.length-2);

                player.addNightInformation(new ChatMessageState(null,
                    "You framed these visitors: "+outString, GameManager.COLOR.GAME_TO_YOU), true);

                
            }else{
                //frame player
                myTarget.extra.framed = true;
                myTarget.cycleVariables.isSuspiciousTonight.value = true;
                myTarget.cycleVariables.investigativeResultTonight.value = "Framer";
            }
        },
        (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return (
                //myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alives
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1    //havent already targeted at least 1 person
            );
        },
        null
    ),
    "Disguiser":new Role(
        "Disguiser", "Target two players to disguise them as eachother", "🎭",
        "Swaps all results for both players. One player looks like the other, even names will change for lookout. \n"+
        "If you disguise two suspicious seeming townies as eachother, then their results will be changed and investigative roles will likely think their lying and lynch the townies.",
        "2 > Disguise",
        "Mafia", "Deception", "Mafia",
        "Mafia", Infinity,
        0, 0,
        true, false, true,
        {},
        (priority, player)=>{
            if(priority!==2) return;
            
            if(player.cycleVariables.targeting.value.length !== 2) return;
            if(!player.cycleVariables.aliveTonight.value) return;

            let myTarget1 = player.cycleVariables.targeting.value[0];
            let myTarget2 = player.cycleVariables.targeting.value[1];

            if(!myTarget1.cycleVariables.aliveTonight.value) return;
            if(!myTarget2.cycleVariables.aliveTonight.value) return;

            myTarget1.cycleVariables.disguisedAsTonight.value = myTarget2;
            myTarget2.cycleVariables.disguisedAsTonight.value = myTarget1;
        },
        (myPlayer, otherPlayer)=>{
            return (
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 2 &&   //i havent already targeted at least 2 people
                (myPlayer.cycleVariables.targeting.value[0] !== otherPlayer)  //cant target same person twice
            );
        },
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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;
            if(player.roleExtra.cleansLeft <= 0) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            player.roleExtra.cleansLeft--;

            
            myTarget.cycleVariables.shownRoleName.value = "Cleaned";
            myTarget.cycleVariables.shownWill.value = "Cleaned";
            if(!myTarget.alive){
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets role was "+myTarget.roleName,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets will was :"+myTarget.savedNotePad['Will'],
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
        },
        (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return(
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1 &&   //havent already targeted at least 1 person
                myPlayer.roleExtra.cleansLeft > 0  //has cleans left
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
            if(player.cycleVariables.targeting.value.length !== 1) return;
            if(!player.cycleVariables.aliveTonight.value) return;
            if(player.roleExtra.forgesLeft <= 0) return;

            let myTarget = player.cycleVariables.targeting.value[0];
            if(!myTarget.cycleVariables.aliveTonight.value) return;

            player.roleExtra.forgesLeft--;

            //find what shownRoleName should be changed to
            let roleNameIndex = Infinity;
            let foundShownRoleName = null;
            let foundShownWill = null;

            //find lowest index that a roleName appears at
            for(let roleName in ROLES){
                let capitalRoleName = roleName.toLocaleUpperCase();
                let index = player.cycleVariables.shownNote.value.indexOf(capitalRoleName);

                if(roleNameIndex > index && index!==-1){
                    roleNameIndex = index;
                    foundShownRoleName = roleName;
                }
            }
            //remove the rolename from the notepad to get the will
            if(roleNameIndex!==Infinity){
                //remove roleName from will
                foundShownWill = player.cycleVariables.shownNote.value.substring(roleNameIndex+foundShownRoleName.length, player.cycleVariables.shownNote.value.length).trim();

                //actually change everything
                myTarget.cycleVariables.shownRoleName.value = foundShownRoleName?foundShownRoleName:"Incomprehensible";
                myTarget.cycleVariables.shownWill.value = foundShownWill?foundShownWill:"";
            }

            if(!myTarget.alive){
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets real role was "+myTarget.roleName,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your targets real will was :"+myTarget.savedNotePad['Will'],
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
        },
        (myPlayer, otherPlayer)=>{
            let otherInMyTeam = Role.onSameTeam(myPlayer, otherPlayer);
            return(
                myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                !otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1 &&   //havent already targeted at least 1 person
                myPlayer.roleExtra.forgesLeft > 0  //has forges left
            );
        },
        null
    ),
    //#endregion
    //#region Neutral
    "Jester":new Role(
        "Jester", "Your goal is to be lynched. If you are lynched, you may kill one player after the fact", "🤡",
        "You have no night ability untill you are lynched. Then you can kill anybody who voted you guilty with an unstoppable(3) attack. \n"+
        "Try to look like an evil role who is pretending to be a townie, but if you just say your mafia then it will be obvious you are the Jester.",
        "-12 > Kill,",
        "Neutral", "Evil", null,
        null, Infinity,
        0, 3, 
        true, true, false,
        {},
        (priority, player)=>{
            if(priority===-12) return;
            if(player.cycleVariables.aliveTonight.value) return;

            if(player.cycleNumberDied !== GameManager.host.cycleNumber)  return;
            if(GameManager.host.cycleVariables.playerOnTrial.value !== player) return;

            if(player.cycleVariables.targeting.value.length !== 1) return;
            let myTarget = player.cycleVariables.targeting.value[0];

            if(myTarget.cycleVariables.judgement.value > 0) return;
            if(!myTarget.cycleVariables.aliveTonight.value) return;
            
            myTarget.tryNightKill(player, 3);
        },
        (myPlayer, otherPlayer)=>{
            return(
                otherPlayer.cycleVariables.judgement.value <= 0 && //voted guilty
                !myPlayer.cycleVariables.aliveTonight.value &&    //im dead
                myPlayer.cycleNumberDied === GameManager.host.cycleNumber &&   // i just died
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.targeting.value.length < 1    //i didnt already target someone
            );
        },
        null
    ),
    "Executioner":new Role(
        "Executioner", "Your goal is to get your target lynched, If your target dies by other means. You will become a Jester.", "🪓",
        "You have no night ability. Your target will always be a town member, but never a mayor. If your target is lynched, you win, and get to stay in the game.",
        "8 > Convert to jester when target died",
        "Neutral", "Evil", null,
        null, Infinity,
        1, 0,
        true, true, false,
        {executionerTarget : null},
        (priority, player)=>{
            if(priority!==8) return;
            if(
                (player.roleExtra.executionerTarget!==null &&
                !player.roleExtra.executionerTarget.alive &&
                player.roleExtra.executionerTarget.cycleVariables.diedTonight.value) ||
                player.roleExtra.executionerTarget === null
                )
                GameManager.host.changePlayerRole(player, "Jester");
        },
        (myPlayer, otherPlayer)=>false,
        null
    ),
    "Witch":new Role(
        "Witch", "Target 2 players, the first one will be forced to target the second one", "🧙‍♀️",
        "The first persons target will be changed to be your second target. Your ability wont work if the first target is witch immune. Your second target is an astral visit.\n"+
        " You have a sheild that grants you basic defense(1), this sheild dissapears after you were attacked, even if you were saved by a protective role. Because you win with any team that isnt town, You should try your best to find out who else is evil and get them to work with you.",
        "-8 > Controll target, tell show that they were controlled, and give self sheild,\n"+
        "12 > steal their information and loose sheid after attacked,",
        "Neutral", "Evil", null,
        null, Infinity,
        0, 0,
        false, false, false,
        {hasSheild : true},
        (priority, player)=>{
            if(priority === -8){

                //give witch sheild
                if(player.cycleVariables.defenseTonight.value < 1 && player.roleExtra.hasSheild)
                    player.cycleVariables.defenseTonight.value = 1;
            
                //then normal stuff
                if(player.cycleVariables.targeting.value.length !== 2) return;
                if(!player.cycleVariables.aliveTonight.value) return;

                let myTarget1 = player.cycleVariables.targeting.value[0];
                let myTarget2 = player.cycleVariables.targeting.value[1];

                if(!myTarget1.cycleVariables.aliveTonight.value) return;
                if(!myTarget2.cycleVariables.aliveTonight.value) return;

                if(!myTarget1.getRoleObject().witchable){

                    player.addNightInformation(new ChatMessageState(
                        null,
                        "Your target was immune to being controlled",
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);

                    myTarget1.addNightInformation(new ChatMessageState(
                        null,
                        "A witch tried to control you but you are immune",
                        GameManager.COLOR.GAME_TO_YOU
                    ), false);
                    return;
                }

                myTarget1.addNightInformation(new ChatMessageState(
                    null,
                    "You were controlled by a witch",
                    GameManager.COLOR.GAME_TO_YOU
                ), false);
                myTarget1.cycleVariables.targeting.value = [myTarget2];
                player.addNightInformation(new ChatMessageState(
                    null,
                    "Your first targets role was "+myTarget1.roleName,
                    GameManager.COLOR.GAME_TO_YOU),
                    true
                );
            }
            else if(priority === 12){

                //remove sheild
                if(player.cycleVariables.extra.value.attackedTonight)
                    player.roleExtra.hasSheild = false;

                
                //if targeting someone
                if(player.cycleVariables.targeting.value.length !== 2) return;
                if(!player.cycleVariables.aliveTonight.value) return;

                let myTarget1 = player.cycleVariables.targeting.value[0];                
                let myTarget2 = player.cycleVariables.targeting.value[1];

                if(!myTarget1.cycleVariables.aliveTonight.value) return;
                if(!myTarget2.cycleVariables.aliveTonight.value) return;

                if(!myTarget1.getRoleObject().witchable) return;
                
                //steal information
                for(let i in myTarget1.cycleVariables.nightInformation.value){
                    player.addNightInformation(
                        new ChatMessageState(
                            myTarget1.cycleVariables.nightInformation.value[i][0].title,
                            "Targets message: "+myTarget1.cycleVariables.nightInformation.value[i][0].text,
                            GameManager.COLOR.GAME_TO_YOU
                        ),
                        myTarget1.cycleVariables.nightInformation.value[i][1]
                    );
                }
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                myPlayer.cycleVariables.targeting.value.length < 2 &&   //havent already targeted at least 2 person
                (
                    (myPlayer.cycleVariables.targeting.value.length === 0 && myPlayer !== otherPlayer) ||
                    (myPlayer.cycleVariables.targeting.value.length === 1)
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
            if(!player.cycleVariables.aliveTonight.value) return;
            
            if(priority === -12){   //clean gas
                
                if(player.cycleVariables.targeting.value.length !== 0) return;
                if(player.extra.doused)
                    player.addNightInformation(new ChatMessageState(
                        null,
                        "You cleaned the gas off yourself",
                        GameManager.COLOR.GAME_TO_YOU),
                        true
                    );
                player.extra.doused = false;
            }
            if(priority === 2){ //douse

                //visit douse
                for(let i in player.cycleVariables.targetedBy.value){
                    if(player.cycleVariables.targetedBy.value[i] === player) continue;

                    player.addNightInformation(new ChatMessageState(
                        null,
                        "You doused a visitor named "+player.cycleVariables.targetedBy.value[i].name,
                        GameManager.COLOR.GAME_TO_YOU
                    ), true);
                    
                    player.cycleVariables.targetedBy.value[i].extra.doused = true;
                    player.cycleVariables.targetedBy.value[i].cycleVariables.isSuspiciousTonight.value = false;
                    player.cycleVariables.targetedBy.value[i].cycleVariables.investigativeResultTonight.value = "Arsonist";
                }

                //regular douse
                if(player.cycleVariables.targeting.value.length !== 1) return;
                let myTarget = player.cycleVariables.targeting.value[0];

                if(player.cycleVariables.targeting.value[0] === player) return;
                if(!myTarget.cycleVariables.aliveTonight.value) return;

                myTarget.extra.doused = true;
                myTarget.cycleVariables.isSuspiciousTonight.value = false;
                myTarget.cycleVariables.investigativeResultTonight.value = "Arsonist";

                player.addNightInformation(new ChatMessageState(
                    null,
                    "You doused "+myTarget.name,
                    GameManager.COLOR.GAME_TO_YOU
                ), true);
            }
            else if(priority === 6){    //ignite
                if(player.cycleVariables.targeting.value.length !== 1) return;
                let myTarget = player.cycleVariables.targeting.value[0];

                if(myTarget !== player) return;

                for(let playerName in GameManager.host.players){
                    let dousedPlayer = GameManager.host.players[playerName];
                    if(dousedPlayer.extra.doused)
                        dousedPlayer.tryNightKill(player, player.cycleVariables.attackTonight.value);
                }
            }

        },
        (myPlayer, otherPlayer)=>{
            return (
                //myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                //!otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1    //havent already targeted at least 1 person
            );
        },
        null
    ),
    "Werewolf":new Role(
        "Werewolf", "Target a player to rampage at their house, attacking them and everyone who visits them. If you target youself, you will rampage your own house. This doesnt work nights 1 and 3.", "🐺",
        "You look innocent, however, if you attack someone, you will look suspicious.",
        "2 > make self suspicious, \n"+
        "6 > attack and rampage,",
        "Neutral", "Killing", null,
        "Werewolf", 1,
        1, 2,
        false, true, false, //fix roleblock stuff later
        {},
        (priority, player)=>{
            if(!player.cycleVariables.aliveTonight.value) return;

            if(priority === 2){ //make suspicious

                if(player.cycleVariables.targeting.value.length !== 1) return;
                player.cycleVariables.isSuspiciousTonight.value = true;

            }
            else if(priority === 6){    //attack and rampage
                if(player.cycleVariables.targeting.value.length !== 1) return;
                let myTarget = player.cycleVariables.targeting.value[0];

                //kill target
                if(myTarget !== player){
                    myTarget.tryNightKill(player, player.cycleVariables.attackTonight.value);
                }

                //kill all visitors
                for(let i in myTarget.cycleVariables.targetedBy.value){
                    //exept yourself 
                    if(player === myTarget.cycleVariables.targetedBy.value[i]) continue;
                    myTarget.cycleVariables.targetedBy.value[i].tryNightKill(player, player.cycleVariables.attackTonight.value);
                }
            }
        },
        (myPlayer, otherPlayer)=>{
            return (
                !(GameManager.host.cycleNumber === 1 || GameManager.host.cycleNumber === 3) &&   //its not night 1 or 3
                //myPlayer.name!==otherPlayer.name && //Not targeting myself
                otherPlayer.cycleVariables.aliveTonight.value && //theyre alive
                myPlayer.cycleVariables.aliveTonight.value && //im alive
                //!otherInMyTeam && //not on same team
                myPlayer.cycleVariables.targeting.value.length < 1    //havent already targeted at least 1 person
            );
        },
        null
    )
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
+2: Doctor(Heal), Blackmailer(Decide), Crusader(Heal), Arsonist(Douse), Framer, Disguiser Werewolf(innos themself)
+4: Sheriff, Invest, Consig, Lookout, Tracker, Arsonist(Find who visited)
+6: Mafioso/Godfather, SerialKiller, Werewolf, Veteran, Vampire, Arsonist, Crusader, Bodyguard, Vigilante (All kill)
+8: Amnesiac(Convert) Vampire(Convert) Forger(Change info), Janitor(Clean & info), Doctor(Notify) Bodyguard(Notify)
+10 Spy(Collect info)
+12 Witch(Steal info & Remove sheild
    
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
        //choose a role

        //find how many are already in the game
        let alreadyPickedCount = 0;
        for(let i in alreadyPickedRolesList){
            if(roleName === alreadyPickedRolesList[i]){
                alreadyPickedCount++;
            }
        }

        if(
            !allRoles.includes(r.name) &&   // add it if its not already in the list
            alreadyPickedCount < r.maximumCount &&  //add it if we have less than the maximum number
            r.faction === faction && r.alignment === alignment  //add it if its the correct faction and the correct alignment
        ) 
        allRoles.push(r.name);
    }
    return allRoles;
}

