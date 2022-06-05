import PubNub from "pubnub"

class GameManager
{
    constructor()
    {
        this.roomCode = 0;
        this.host = false;
        this.joinedGame;
        this.name = "";

        this.gameState = {};
    }
    static instance = new GameManager();

    pubNubListener(){return{
        message: function (m)
        {
            console.log("Recieved");
            switch(m.type){
                case "test":
                    console.log(m.message);
                    break;
                case "joinRequest":
                    console.log(m.message);
                    break;
            }
        },
    };}
    pubNubPublish(publishPayload){
        this.pubnub.publish(publishPayload, function(status, response) {
            // console.log(status, response);
            // console.log(publishPayload);
        });
    };
    pubNubCreatePayLoad(msgChannel, msgType, msg){
        return(
            {
                channel : msgChannel,
                type: msgType,
                message: msg
            }
        );
    }
    startHost()
    {
        this.roomCode = GameManager.generateRandomString(4);
        this.initPubNub(this.roomCode);

        let publishPayload = this.pubNubCreatePayLoad(this.roomCode, "test",
            {text: "Host started"}
        );

        this.pubNubPublish(publishPayload);
    }
    joinGame(){
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