# strophe-chatbot
A simple chatbot that uses the DuckDuckGo Answers API in an XMPP chatroom. Runs on Node.

# How to use:

 1. Set up an XMPP server. (Hopefully you've already done this. If not checkout Prosody!)
 2. Register your bot's account.
 3. In chatbot.js add in your bot's credentials, and your xmpp servers address.
 4. Launch chatbot.js from Node. Consider running it through PM2 so it runs as a background task.
 
# To-do
-Clean up the replace methods, and try to make them into a single regex.
-Add a way for the chatbot to automatically message and request friendship with new members.
