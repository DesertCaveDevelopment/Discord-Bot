// Make sure Node.js V12 or higher is being ran.
if (process.version.slice(1).split('.')[0] < 12) throw new Error('Node 12.0.0 or higher is required.');
// Dependencies
const Discord = require('discord.js');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

// Logger (console log + file log)
bot.logger = require('./modules/logging/logger');
// For command handler
bot.aliases = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.Stats = {
	MessageSent: 0,
	Giveaways: 0,
	WarnedUsers: 0,
	KickedUsers: 0,
	BannedUsers: 0,
	CommandsUsed: 0,
};
// Load commands
(async () => {
	// load commands
	const cmdFolders = await readdir('./commands/');
	bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 97 -=-=-=-=-=-=-=');
	for (let i = 0; i < cmdFolders.length; i++) {
		const cmdFiles = await readdir(`./commands/${cmdFolders[i]}`);
		cmdFiles.forEach(file => {
			const cmds = require(`./commands/${cmdFolders[i]}/${file}`);
			bot.logger.log(`Loading command: ${file}`);
			bot.commands.set(cmds.config.command, cmds);
			if (cmds.config.aliases) {
				cmds.config.aliases.forEach(alias => {
					bot.aliases.set(alias, cmds.config.command);
				});
			}
		});
	}
	// load events
	const evtFiles = await readdir('./events/');
	bot.logger.log(`=-=-=-=-=-=-=- Loading events(s): ${evtFiles.length} -=-=-=-=-=-=-=`);
	evtFiles.forEach(file => {
		const eventName = file.split('.')[0];
		bot.logger.log(`Loading Event: ${eventName}`);
		const event = require(`./events/${file}`);
		bot.on(eventName, event.bind(null, bot));
	});

	// connect to database and get global functions
	bot.mongoose = require('./modules/database/mongoose');
	require('./utils/global-functions.js')(bot);

	// Load config for bot
	try {
		bot.config = require('./config.js');
	} catch (err) {
		console.error('Unable to load config.js \n', err);
		process.exit(1);
	}

	// Interact with console
	const y = process.openStdin();
	y.addListener('data', res => {
		const message = res.toString().trim();
		const args = res.toString().trim().split(/ +/g);
		// now run command
		if (args.length == 0) return;
		require('./utils/console.js').run(args, message, bot);
	});

	// Connect bot to database
	bot.mongoose.init(bot);

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();
