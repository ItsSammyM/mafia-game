import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import PubNub from "pubnub"

var pubnub = new PubNub({
  publishKey : "pub-c-f6860906-b4ba-4702-8e65-2b88b0026fdf",
  subscribeKey : "sub-c-253627e6-df37-4bd4-ba07-57e843d14d3d",
  uuid: Date.now().toString() + " " + Math.random().toString() + " " + Math.random().toString()
});
pubnub.subscribe({
  channels: ["hello_world"]
});
pubnub.addListener({
  message: function (m) {
    // handle messages
    console.log(m.message.title)
  },
});
var publishPayload = {
  channel : "hello_world",
  message: {
      title: "greeting",
      description: "This is my first message!"
  }
};
pubnub.publish(publishPayload, function(status, response) {
  console.log(status, response);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
