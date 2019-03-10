// Programmer:	Gonzalo Pantoja1
// Date:	11/10/2018
// Purpose: 	Discord bot to save meetings times and locations.
// 		Only displays meetings after todays date.
// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Load the config.json file that contains our token and our prefix values. 
const config = require("./auth.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

// Read meetingdata.txt file from local storage into a variable
const path = "meetingdata.txt"
var fs = require("fs");
var file = fs.readFileSync(path, "utf8");
var meetings = file.trim().split(/\r?\n/);
// Initialize variables for bot commands
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Initialize variables for new user message
const newUsers = [];

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // Ignore other bots. This also makes the bot ignore itself
  // and not get into a spam loop.
  if(message.author.bot) return;
  
  // Ignore any message that does not start with our prefix, which is set in the 
  // configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Displays all meetings
  if(command === "meetings") {
    // Read file and populate meetings array in case a new entrie have been added
    file = fs.readFileSync(path, "utf8");
    meetings = file.trim().split(/\r?\n/);
    var today = new Date();
    var today_dd = today.getDate();
    if(today_dd<10) { today_dd = '0'+today_dd; }    // Format to 01 02 ect
    var today_mm = today.getMonth()+1; // Jan starts at 0
    if(today_mm<10) { today_mm = '0'+today_mm; }    // Format to 01 01 ect
    var today_yyyy = today.getFullYear();
    today = today_yyyy + '/' + today_mm + '/' + today_dd;

    message.channel.send("Upcoming Meetings:");
    // Loop though meetings array and display them
    for (var i = 0; i < meetings.length; i++) {
	    // Split string into an array
	    var meeting_info = meetings[i].trim().split(/ +/g);
	    // Create a date object with date given in argument
	    var meeting_date = new Date(meeting_info[0]);
	    // Gets meetings date in YYYY/MM/DD to compare with current date
	    var meeting_yyyy = meeting_date.getFullYear();
	    var meeting_mm = meeting_date.getMonth()+1;
	    if(meeting_mm<10) { meeting_mm = '0'+meeting_mm; }
	    var meeting_dd = meeting_date.getDate();
	    if(meeting_dd<10) { meeting_dd = '0'+meeting_dd; }
	    // Only display if meeting date is >= todays date
	    var meeting_YYYYMMDD = meeting_yyyy + '/' + meeting_mm + '/' + meeting_dd;
	    if(meeting_YYYYMMDD >= today) { 
		    // Gets weekday name
		    var weekday = days[meeting_date.getDay()];
		    // Gets month name
		    var month = months[meeting_date.getMonth()];
		    // Gets day
		    var day = meeting_date.getDate();
		    // Save time 
		    time = meeting_info[1];
		    // Save the rest of the message in a string varibale called info
		    var info = "";
		    for(var j = 2; j < meeting_info.length; j++) {
			info += meeting_info[j] + " ";
	    	}
	    	// Display meeting
	    	message.channel.send("**" + weekday + " " + month + " " + day + "th " + time + "**   " + info);
    	    }
    }
  }
// Add a meeting to meeting array
if(command === "addmeeting") {
    // Command only available to President, Vice President, or Secretary
    if(!message.member.roles.some(r=>["President", "Vice President", "Secretary"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    // Make sure the arguments passed is more than 5
    //              (Mon Jan 1 4:00 Bla-bla-meeting-room-number-bla)
    if(args.length > 1) {
	// Make sure day name is valid
	// Accounts for Feb having a shorter month
	if(/((0?[13578]|10|12)(-|\/)((0[0-9])|([12])([0-9]?)|(3[01]?))(-|\/)((\d{4})|(\d{2}))|(0?[2469]|11)(-|\/)((0[0-9])|([12])([0-9]?)|(3[0]?))(-|\/)((\d{4}|\d{2})))/.test(args[0])) {
		// Make sure time is valid
		if(/\d\d?:\d\d/.test(args[1])) {
			// Add meeting to meeting array
			meetings.push(args.join(" "));
			// Sort array in order
			meetings.sort();
			// Put meetings array information into text file
			var new_meetings_data = meetings.join("\n");
			fs.writeFile(path, new_meetings_data, function (err) {
				// Checks if there is an error
				if (err) message.chennel.send(err);
			});
			message.channel.send("Meeting added");
		} else {
			// Display error if time isn't XX:XX or X:XX
			message.reply("Time isn't in XX:XX or X:XX format. Ex. MM/DD/YYYY XX:XX [message]")
		}
	} else {
		// Display error if date isn't YYYY/MM/DD
		message.reply("Date isn't in YYYY/MM/DD format. Ex. MM/DD/YYYY XX:XX [message]")
	}
    } else {
	    // Display error if less than 3 argsuments passed 
	    message.reply("Error. Try using this format: MM/DD/YYYY XX:XX [message]} Ex. 1/9/2018 5:00 Meeting in room 101");
    }
  }

  if(command === "say") {
    // Command only available to President, Vice President, or Secretary
    if(!message.member.roles.some(r=>["President", "Vice President", "Secretary"].includes(r.name)) )
      return message.reply("I'm not saying that");

    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
});

// New user welcome message
client.on(`guildMemberAdd`, member => {
	var generalChat = member.guild.channels.find(channelName => channelName.name === "general");
	    
	if (generalChat) {
	    // Send greeting message in general chat
            generalChat.send(`${member.user}, welcome to the server! 
Reply with the following info to get access:
*first name*
*last name*
*major*
**Note: if you have class specific questions ask them in its corresponding chat, some TAs are actually there to help so @ them! Or just share your memes in general (っ▀¯▀)つ**`);
        } else {
	        member.guild.defaultChannel.send(`${member.username}, welcome to the server!
Reply with the following info to get access:
*first name*
*last name*
*major*
**Note: if you have class specific questions ask them in its corresponding chat, some TAs are actually there to help so @ them! Or just share your memes in general (っ▀¯▀)つ**`);
	}
});
			

client.login(config.token);
