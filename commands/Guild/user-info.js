// Dependencies
const Discord = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message, args) => {
	// Get user
	let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!user) {
		user = message.guild.member(message.author);
	}
	// Get emoji (for status)
	let emoji;
	if (user.presence.status == 'online') {
		emoji = '🟢';
	} else if (user.presence.status == 'idle') {
		emoji = '🟡';
	} else if (user.presence.status == 'offline') {
		emoji = '⚫';
	} else {
		emoji = '🔴';
	}
	// Display user informaion
	const embed = new Discord.MessageEmbed()
		.setAuthor(`User info for ${user.user.username}#${user.user.discriminator}`, user.user.displayAvatarURL())
		.setThumbnail(user.user.displayAvatarURL())
		.addField('Nickname:', user.nickname != null ? user.nickname : '-', true)
		.addField('Status', `${emoji} ${user.presence.status}`, true)
		.addField('📋Joined Discord', moment(user.user.createdAt).format('lll'), true)
		.addField('📋Joined Server', moment(user.joinedAt).format('lll'), true)
		.addField(`Roles [${user.roles.cache.size}]`, user.roles.cache.map(roles => roles).join(', '), true)
		.addField('Activity', (user.presence.game) ? user.presence.game.name : '-', true)
		.setTimestamp()
		.setFooter(`Requested by ${message.author.username}`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'user-info',
	aliases: ['userinfo', 'whois'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'User info',
	category: 'Guild',
	description: 'Gets information on a user',
	usage: '${PREFIX}user-info [user]',
};
