import PubNub from "pubnub"

class GameManager
{
    constructor()
    {
        this.roomCode = 0;
        this.host = false;

        this.gameState = {};
    }
    static instance = new GameManager();
    startHost()
    {
        this.roomCode = GameManager.generateRandomString(4);
        this.initPubNub(this.roomCode);
        

        this.pubnub.addListener({
            message: function (m)
            {
                if(m.message.type == "test"){
                    console.log(m.message.type);
                }
            },
        });
        
        var publishPayload = {
            channel : this.roomCode,
            message: {
                type: "test",
                text: "This is my first message!"
            }
        };
        this.pubnub.publish(publishPayload, function(status, response) {
            console.log(status, response);
            console.log(publishPayload);
        });
    }
    joinGame(){
        
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
    }
    // static testPubNub()
    // {
    //     var publishPayload = {
    //     channel : "hello_world",
    //     message: {
    //         title: "greeting",
    //         description: "This is my first message!"
    //     }
    //     };
    //     this.pubnub.publish(publishPayload, function(status, response) {
    //         console.log(status, response);
    //     });
    // }
    // static createPubNub()
    // {
        
    //     this.pubnub.addListener({
    //         message: function (m)
    //         {
    //           console.log(m.message.title)
    //         },
    //     });
    // }

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