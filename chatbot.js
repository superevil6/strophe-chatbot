// Requirements
const fetch = require('node-fetch');
const strophe = require("node-strophe").Strophe;
const Strophe = strophe.Strophe;
// Bot setup
const server = 'https://conference.alexcassells.com:5281/http-bind';
const botJID = 'chatbot@alexcassells.com';
const botNick = 'ChatBot';
const botPassword = 'chatbotman';

// Multichannel options
const mucBot = true;
const roomJID = 'chat@conference.alexcassells.com';

//Connections

const BOSH_SERVICE = server;
const connection = new Strophe.Connection(BOSH_SERVICE, 'keepalive');

//Connect
console.log("Connecting...");
// connection.rawInput = connection.rawOutput = console.log;


connection.connect(botJID, botPassword, (status) => {
    if (status === Strophe.Status.CONNECTED) {
        console.log('Connected!');

        if(mucBot){
            console.log("joining muc: " + roomJID);
            connection.send(strophe.$pres({ from: botJID, to: roomJID+'/'+botNick }).c("x", {'xmlns': 'http://jabber.org/protocol/muc'}).up());
        }
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


//Basic functions
const sendCustomMessage = (to, from, body) =>{
    console.log("to: " + to + "from: " + from);
    let type = 'chat';
    if(to.includes(roomJID)){
        type = 'groupchat';
    }roomJID
    let message = new Strophe.Builder("message", {"to": to, "from": from, "type" : type }).c("body").t(body);
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
    return true;
}

//Message Parsing
const parseMessage = (stanza) => {
    let to = stanza.getAttribute('to');
    let from = stanza.getAttribute('from');
    if(from.includes(roomJID)){
        console.log(from);
        from = roomJID;
        console.log(from);
    }
    let type = stanza.getAttribute('type');
    let elems = stanza.getElementsByTagName('body');
    if ((type == "chat" || type == "groupchat") && elems.length > 0) {
        var body = elems[0];
        if(Strophe.getText(body).length > 0){
            message = Strophe.getText(body).toLowerCase();
            checkForQuestions(from, to, message);
        };
        watchForMessages();
    }
    else{
        watchForMessages();
    }

}

const checkForQuestions = (from, to, message) => {
    if( 
        message.includes("what is") || 
        message.includes("what are") || 
        message.includes("who is") || 
        message.includes("who are")){
        //removes question formatting like the above examples.
        let question = formatBasicQuestion(message);
        //If it contains math symbols:
        if(question.match(/[\d\(\)\+\-\*\/\.]/)){
            let formattedQuestion = formatMathQuestion(question);
            askMathApi(from, to, formattedQuestion);
        }

        else{
            //Standard encyclopedic question
            let formattedQuestion = formatInformationQuestion(question);
            askDuckDuckGo(from, to, formattedQuestion);
        }
    }
    else if(message.includes("joke")){
        console.log("contains a joke");
        tellAJoke(from, to);
    }
}

//Question formatting
const formatBasicQuestion = (message) =>{
    console.log("basic formatting question");
    message = message.replace('what is the ', '');
    message = message.replace('what are ', '');
    message = message.replace('what is a ', '');
    message = message.replace('what is ', '');
    message = message.replace('who is ', '');
    message = message.replace('who are ', '');
    return message;
}

const formatInformationQuestion = (question) => {
    question = question.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
    question = question.replace(/ /g, '+');
    return question;
}

const formatMathQuestion = (question) =>{
    question = question.replace(/ /g, '');
    return question = encodeURIComponent(question);
}


//API handling
const askDuckDuckGo = async (from, to, formattedQuestion) => {
    return await fetch('https://api.duckduckgo.com/?q=' + formattedQuestion + '&format=json')
        .then((response) => {
            return response.json();
        })
  .then((json) => {
    if(json.RelatedTopics.length > 0){
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
  }).catch((err) => {
    console.error('Error:', err);
  });
}

const askMathApi = async (from, to, formattedQuestion) => {
    return await fetch('https://newton.now.sh/simplify/' + formattedQuestion)
        .then((response) => {
            return response.json();
        })
  .then((json) => {
    let answer = json.result;
    if(json){
        sendCustomMessage(from, to, answer);
    }
    else{
        sendCustomMessage(from, to, "Sorry " + to + ", I don't know the answer, try formatting your question differently.");
    }
  }).catch((err) => {
    console.error('Error:', err);
  });
}

const tellAJoke = async (from, to) => {
    return await fetch('https://sv443.net/jokeapi/v2/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist&type=single')
        .then((response) => {
            return response.json();
        })
  .then((json) => {
    console.log(json);
    sendCustomMessage(from, to, json.joke);
  }).catch((err) => {
    console.error('Error:', err);
  });
}