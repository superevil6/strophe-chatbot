// Requirements
const fetch = require('node-fetch');
const strophe = require("node-strophe").Strophe;

const Strophe = strophe.Strophe;
// Bot setup
let server = 'https://conference.alexcassells.com:5281/http-bind';
let botJID = 'chatbot@alexcassells.com';
let botNick = 'ChatBot';
let botPassword = 'chatbotman';

//Connections

let BOSH_SERVICE = server;
let connection = new Strophe.Connection(BOSH_SERVICE, 'keepalive');

//Connect
console.log("Connecting...");

connection.connect(botJID, botPassword, (status) => {
    if (status === Strophe.Status.CONNECTED) {
        console.log('Connected!');
        connection.send(strophe.$pres());
        watchForMessages();

    }
    else if (status == Strophe.Status.CONNFAIL) {
        console.log('Connection failed.');
    }
    else if (status === Strophe.Status.DISCONNECTED) {
        console.log('Disconnected.');
    }
    else {
        console.log('Retrying connection.');
    }
});

const sendCustomMessage = (to, from, body) =>{
    let message = new Strophe.Builder("message", {"to": to, "from": from, "type" : "chat" }).c("body").t(body);
    message.up().c("data", {xmlns: 'my-custom-data-ns'});
    connection.send(message);
}

const watchForMessages = () =>{
    connection.addHandler(
        parseMessage, 
        null, 
        'message',
        null, 
        null, 
        null, 
        null);
}

const parseMessage = (stanza) => {
    let to = stanza.getAttribute('to');
    let from = stanza.getAttribute('from');
    let type = stanza.getAttribute('type');
    let elems = stanza.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
        var body = elems[0];
        if(Strophe.getText(body).length > 0){
            message = Strophe.getText(body).toLowerCase();
            console.log(message);
            let question = checkForQuestions(message);
            if(question){
                console.log(question);
                askDuckDuckGo(from, to, question);
            }
            else{

            }
        };
        watchForMessages();
    }
    else{
        watchForMessages();
    }

}

const checkForQuestions = (message) => {
    if(
        message.includes("what is") || 
        message.includes("what are") || 
        message.includes("who is") || 
        message.includes("who are")){
        return formatQuestion(message);
    }
    // if(message.includes("how much is") || 
    // message.includes("how much are")){
    //     return formatPriceCheck(message);
    // }
}

const formatQuestion = (message) => {
    message = message.replace('what is the ', '');
    message = message.replace('what are ', '');
    message = message.replace('what is a ', '');
    message = message.replace('what is ', '');
    message = message.replace('who is ', '');
    message = message.replace('who are ', '');
    message = message.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
    console.log("formatted message: " + message);
    message = message.replace(/ /g, '+');
    return message;
}

// Waiting to find a free price checking API
// const formatPriceCheck = (message) =>{
//     message = message.replace('how much is', '');
//     message = message.replace('how much are', '');
//     message = message.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
//     return message; 
// }

const askDuckDuckGo = async (from, to, question) => {
    let answer = await fetch('https://api.duckduckgo.com/?q=' + question + '&format=json')
    let json = await answer.json();
    if(json.RelatedTopics.length > 0){
        console.log(json);
        if(json.Abstract){
            answer = json.Abstract;
        }
        else{
            answer = json.RelatedTopics[0].Text;
        }
        if(answer){
            sendCustomMessage(from, to, answer);
        }
    }
    else{
        let response = "Sorry " + to + ", I don't know what that is."
        sendCustomMessage(from, to, response);
    }
}