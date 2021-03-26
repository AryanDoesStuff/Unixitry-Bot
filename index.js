/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-const-assign */
/* eslint-disable no-unused-vars */
// Vars, Imports, And Configs
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');
const Canvas = require('canvas');
let sentChannel = 'general'
let prefixChange = false;
let needHelp = false;
let helpWith = 'Nothing';
let isSetup = false;
let configureState = 'none';
let isConfiguring = false;
dotenv.config();
// Logs ready to console when bot turns on
client.on('ready', () => {
	console.log('Im Ready');
});
//setting the PREFIX
let prefix = '?';
// Send A message when the bot joins the guild
client.on("guildCreate", guild => {
    let channelID;
    let channels = guild.channels.cache;
    for (let key in channels) {
        let c = channels[key];
        if (c[1].type === "text") {
            channelID = c[0];
            break;
        }
    }

    let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
    channel.send(`It's time to set me up! run {PREFIX}configure to start setup`);
});

//A method I call when I want to enter the text into the picture instead of waasting processing power to put it on top
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};
//when A user joins the server this is called
client.on('guildMemberAdd', async member => {
	let channel = member.guild.channels.cache.find(ch => ch.name === sentChannel);
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./Unixitree.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	// Slightly smaller text placed above the member's display name
	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

	// Add an exclamation point here and below
	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`Welcome to the server, ${member}!`, attachment);
});
//when someone sends a message this is called
client.on('message', message => {
	//checking if the user is configuring and if so what configuring state they are in
	if (isConfiguring){
		if (message.author.bot){
			return;
		}
		else if (configureState === 'q1'){
			x = message.content
			sentChannel = message.guild.channels.cache.find(channel => channel.name === x);
			message.channel.send("Ok welcome channel set!");
			message.channel.send("Next question: what would you like the prefix to be (you can change this anytime by saying {PREFIX}changePrefix)")
			configureState = 'q2'
		}
		else if (configureState === 'q2'){
			x = message.content
			prefix = x;
			message.channel.send("Ok prefix set!");
			message.channel.send("Alrighty configuration is done :) , if you need to configure anything else Ill ping you!")
			isConfiguring=false;
		}
	}
	// Checking if prefixChange is true and that the message wasn't written by a bot, then changing prefix
	if (prefixChange == true) {
		if(message.author.bot) {
			return;
		}
		prefix = message.content;
		console.log(prefix);
		prefixChange = false;
		message.channel.send(`The prefix was changed to ${prefix}`);
		message.channel.send('THIS PREFIX WONT SAVE AFTER THE NEXT RESTART, THIS WILL BE FIXED SO PLEASE DONT SPAM ME WITH MY PREFIX ISNT SAVED');
	}
	if (needHelp == true) {
        if(message.author.bot) {
			return;
		}
		helpWith = message.content;
		console.log(helpWith);
        if (helpWith == 'name') {
             // eslint-disable-next-line no-empty
            message.channel.send(process.env.nameCMD);
        }
       
		needHelp = false;
		
	}
	// name method call for bot
	if (message.content == prefix + 'name' && message.author != message.author.bot) {
		message.author.send(`hello, ${message.author.username}, my name is MonkeOS Support Bot and the server you are in is called ${message.guild.name}`);
		console.log(`hello, ${message.author.username}, my name is MonkeOS Support Bot and the server you are in is called ${message.guild.name}`);
	}
	// changeprefix method call for bot
	if (message.content == prefix + 'changePrefix' && message.author != message.author.bot) {
		message.channel.send('What would you like me to change it to?');
		prefixChange = true;
	}
	if (message.content == prefix + 'help') {
		message.channel.send('What command do you want to know about?');
		needHelp = true;
	}
	if (message.content == prefix + 'configure'){
		message.channel.send("ok, configure mode enabled(If you want to edit this manually you can edit my config file with vim /etc/unixitry.conf)");
		message.channel.send("First Config: what channel would you like to house welcome messages?");
		configureState = 'q1'
		isConfiguring = true;
	}

	
	// 'Uncomment these lines if you want to make sure your bot is getting input.';
	// const x = message.content;
	// console.log(x);
});
// Logging in as the bot and running everything
client.login(process.env.TOKEN);
