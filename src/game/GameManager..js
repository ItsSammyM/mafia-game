import PubNub from "pubnub"
import Main from "../main/Main";
import {MainMenu} from "../main/mainMenu/MainMenu"
import {GameState} from "./GameState"
import {Player, PlayerState} from "./Player"

class GameManager
{
    constructor()
    {
        this.roomCode = "";
        this.host = false;
        this.joinedGame = null;
        this.name = "";

        this.gameState = new GameState();
    }
    static instance = new GameManager();

    pubNubListener(){return{
        message: function (m)
        {
            console.log("Recieved");
            console.log(m.message);
            switch(m.message.type){
                case "test":
                    console.log(m.message);
                    break;
                case "joinRequest":
                    console.log("request Ackknowledged");
                    if(GameManager.instance.host){
                        console.log("request Ack2323232knowledged");
                        GameManager.instance.gameState.players.push(new Player(m.message.contents.name));
                        console.log("request asdasdas");
                        GameManager.instance.pubNubPublish(GameManager.instance.pubNubCreatePayLoad(GameManager.instance.roomCode, "joinResponse"), 
                            {
                                name: m.message.contents.name,
                                success: true,
                                text: "No Implemented Exeptions"
                            }
                        );
                    }
                    break;
                case "joinResponse":
                    Main.instance.setState({currentMenu: (<MainMenu/>)});
                    break;
            };
        },
    };}
    pubNubPublish(publishPayload){
        this.pubnub.publish(publishPayload, function(status, response) {
            console.log("Sending");
            // console.log(status, response);
            // console.log(publishPayload);
        });
    };
    pubNubCreatePayLoad(msgChannel, msgType, contents){
        return(
            {
                channel : msgChannel,
                message: {
                    type: msgType,
                    contents: contents
                }
            }
        );
    }

    startGame(){
        this.gameState.started = true;
    }

    startHost()
    {
        this.roomCode = GameManager.generateRandomString(4);
        this.initPubNub(this.roomCode);

        this.host = true;
        this.joinGame = true;


        this.pubNubPublish(this.pubNubCreatePayLoad(this.roomCode, "test",
            {text: "Host started"}
        ));

        this.pubNubPublish(this.pubNubCreatePayLoad(this.roomCode, "joinRequest",
            {name: this.name}
        ));

    }
    joinGame(){
        //this.roomCode = this.roomCode.toLowerCase();
        this.initPubNub(this.roomCode);
        let publishPayload = this.pubNubCreatePayLoad(this.roomCode, "joinRequest",
            {
                name: this.name
            }
        );

        this.pubNubPublish(publishPayload);
    }
    initPubNub(channel){
        this.pubnub = new PubNub({
            publishKey : "pub-c-f6860906-b4ba-4702-8e65-2b88b0026fdf",
            subscribeKey : "sub-c-253627e6-df37-4bd4-ba07-57e843d14d3d",
            uuid: Date.now().toString() + " " + GameManager.generateRandomString(5)
        });

        this.pubnub.subscribe({
            channels: [channel]
        });

        this.pubnub.addListener(this.pubNubListener());
    }
    static generateRandomString(length){
        let allChars = "abcdefghijklmnopqrstuvwxyz1234567890";
        let o = "";

        for(let i = 0; i < length; i++)
        {
            let r = Math.random()*allChars.length;
            o+=allChars.substring(r, r+1);
        }
        return o;
    }
}

export default GameManager