import PubNub from "pubnub"

class GameManager
{
    constructor()
    {
        this.pubnub = null;
    }
    testPubNub()
    {
        var publishPayload = {
        channel : "hello_world",
        message: {
            title: "greeting",
            description: "This is my first message!"
        }
        };
        this.pubnub.publish(publishPayload, function(status, response) {
            console.log(status, response);
        });
    }
    createPubNub()
    {
        this.pubnub = new PubNub({
            publishKey : "pub-c-f6860906-b4ba-4702-8e65-2b88b0026fdf",
            subscribeKey : "sub-c-253627e6-df37-4bd4-ba07-57e843d14d3d",
            uuid: Date.now().toString() + " " + Math.random().toString() + " " + Math.random().toString()
        });
        this.pubnub.subscribe({
            channels: ["hello_world"]
        });
        this.pubnub.addListener({
            message: function (m)
            {
              console.log(m.message.title)
            },
        });
    }
    static instance = new GameManager();
}

export default GameManager