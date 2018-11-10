// Programmer:	Gonzalo Pantoja
// Date:	11/10/2018
// Purpose: 	Discord bot to save meetings times and locations
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

  // Sets variables
  const meetings = ["meeting at 3:00","hello"];	
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
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
    message.channel.send("Upcoming Meetings:");
    for (var i = 0; i < meetings.length; i++) {
	    message.channel.send(meetings[i]);
    }
  }
// Add a meeting to meeting array
if(command === "addmeeting") {
    // Command only available to President, Vice President, or Secretary
    if(!message.member.roles.some(r=>["President", "Vice President", "Secretary"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    // Make sure the arguments passed is more than 5
    //              (Mon Jan 1 4:00 Bla-bla-meeting-room-number-bla)
    if(args.length > 4) {
	// Make sure day name is valid
	if(days.indexOf(args[0]) > -1) {
		// Make sure month is valid
		if(months.indexOf(args[1]) > -1) {
			// Make sure day is between 1 and 31
			if(args[2] >= 1 && args[2] <= 31) {
				// Check if time is in valid format
				if(/\d\d?:\d\d/.test(args[3])) {
					// Add meeting to meeting message if passed validation
					meetings.push(args.join(" "));
					message.channel.send("Meeting added")
				} else {
					// Display error if numaric day isn't between 1 and 31
					var temp = [];
					temp.push(args[3]);
					temp.push(" isn't in x:xx or xx:xx format (Ex. 1:00)");
					temp.join("");
					message.channel.send(temp);

				}
			} else {
				// Display error if numaric day isn't between 1 and 31
				var temp = [];
				temp.push(args[2]);
				temp.push(" isn't between 1 and 31");
				temp.join("");
				message.channel.send(temp);

			}
		} else {
			// Display error if month isn't valid
			var temp = [];
			temp.push(args[1]);
			temp.push(" isn't Jan, Feb, Mar, ect");
			temp.join("");
			message.channel.send(temp);
		}
	} else {
		// Display error if day name isn't valid
		var temp = [];
		temp.push(args[0]);
		temp.push(" isn't Mon, Tue, Wed, Thu, Fri, Sat, or Sun");
		temp.join("");
		message.channel.send(temp);
	}
    } else {
	    // Display error if less than 5 argsuments passed 
	    message.channel.send("Error. Try using this format: [day] [month] [day numaric] [message]}");
	    message.channel.send("Ex. Mon Jan 1 12:1:00 club meeting room 101");
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

client.login(config.token);
