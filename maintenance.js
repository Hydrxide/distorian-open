const Discord = require("discord.js");
const config = require("./config.json");
const login = require("./login.json");

const client = new Discord.Client();
client.login(login.LOGIN_TOKEN);

client.on("ready", () => {
    console.log(`Logged into ${client.user.tag} in MAINTENANCE MODE.`);
});

const commands = [config.ARCHIVE_COMMAND, config.SET_ARCHIVE_COMMAND, config.SETUP_COMMAND, config.SET_ROLE_COMMAND, config.INVITE_COMMAND, config.HELP_COMMAND];

client.on("message", message => {
    if (!(message.channel.type == 'text'))
            return;

    if (!message.content.startsWith(config.COMMAND_PREFIX))
            return;

    for (var index in commands) {
        if(message.content.startsWith(config.COMMAND_PREFIX + commands[index])) {
            message.channel.send(config.WARNING_MESSAGE);
        }
    }
});
