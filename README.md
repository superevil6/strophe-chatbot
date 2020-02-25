# strophe-chatbot
A simple chatbot that uses the DuckDuckGo Answers API in an XMPP chatroom. Runs on Node.

# How to use:

 1. Set up an XMPP server. (Hopefully you've already done this. If not checkout Prosody!)
 2. Register your bot's account.
 3. Clone the repo either on your server, or even locally. Run npm install.
 4. In chatbot.js add in your bot's credentials, and your xmpp servers address.
 5. Launch chatbot.js from Node. Consider running it through PM2 so it runs as a background task.
 
# To-do
1. Clean up the replace methods, and try to make them into a single regex.
2. Add a way for the chatbot to automatically message and request friendship with new members.
3. Add websocket option for people not using BOSH.

# Credits:
1. Strophe.JS
2. node-strophe
3. DuckDuckGo - for the answers API
4. newton.now.sh - for the math API
5. sv443.net/jokeapi/v2 - For the joke API
