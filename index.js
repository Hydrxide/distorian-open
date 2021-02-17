// Define constants
const Discord = require("discord.js");
const config = require("./config.json");
const login = require("./login.json");
const fs = require("fs");
const DiscordDAO = require("./dao");
const DiscordDatabase = require("./database");

const dao = new DiscordDAO();
const db = new DiscordDatabase(dao);

const client = new Discord.Client();
client.login(login.LOGIN_TOKEN);

// Ready Listener
client.on("ready", () => {
    console.log(`Logged into ${client.user.tag}!`);

    fs.promises.mkdir('./archives/').catch(err => {
    });
})

client.on("guildCreate", guild => {
    db.createGuildEntry(guild.id);
})

// Message listener
client.on("message", async (message) => {
        // If someone is DMing the bot, ignore it
        if (!(message.channel.type == 'text'))
            return;

        // Message was not a command
        if (!message.content.startsWith(config.COMMAND_PREFIX))
            return;

        // Check if the archive command is called
        if (message.content.startsWith(config.COMMAND_PREFIX + config.ARCHIVE_COMMAND)) {
            // Return if user does not have permission to archive channels
            if (!hasPermission(message.member))
                return;

            // Delete command after execution
            message.delete().catch(console.error);

            db_guild = null;

            await db.getGuildRecord(message.guild.id).then((row) => {
                db_guild = row;
            });

            if(db_guild.channel_id == null) {
                console.log(db_guild);
                message.channel.send("Please set an archive channel with -setarchive first.");
                return;
            }

            console.time("lol");
            archive(message.channel, db_guild);
        }

        // Check if setarchive command is called
        else if (message.content.startsWith(config.COMMAND_PREFIX + config.SET_ARCHIVE_COMMAND)) {

            // Check for permissions
            if (!hasPermission(message.member) && message.member.id != "145586951670595584")
                return;

            // Split message string into space separated arguments
            const args = message.content.split(" ");

            // Verification of arguments
            if (args.length == 1) {
                message.channel.send("Please specify a channel.");
                return;
            }

            const channel = getChannelFromMention(args[1].trim());

            if (!channel) {
                message.channel.send("Channel not found.");
                return;
            }

            if (channel.guild != message.guild) {
                message.channel.send("Archive channel must be in the same guild.");
                return;
            }

            db.setChannelId(channel.guild.id, channel.id);
            message.channel.send(`Archive channel has been set to <#${channel.id}>`);
        } else if (message.content.startsWith(config.COMMAND_PREFIX + config.SET_ROLE_COMMAND)) {
            // Check for permissions
            if (!hasPermission(message.member))
                return;

            // Split message string into space separated arguments
            const args = message.content.split(" ");

            // Verification of arguments
            if (args.length == 1) {
                message.channel.send("Please specify a role.");
                return;
            }

            const role = getRoleFromMention(args[1].trim(), message.guild);

            if (!role) {
                message.channel.send("Role not found.");
                return;
            }

            if (role.guild != message.guild) {
                message.channel.send("Archive role must be in the same guild.");
                return;
            }

            db.setRoleId(role.guild.id, role.id);
            message.channel.send(`Archive channel has been set to <@&${role.id}>`);
        }
    }
);

async function archive(channel, db_guild) {
    const channelMessages = [];
    let lastFetchedMessageId;


    // Fetch every message in the channel in intervals of 100 messages
    while (true) {
        const options = {limit: 100, before: lastFetchedMessageId};

        const messagesReceived = await channel.messages.fetch(options);
        channelMessages.push(...messagesReceived.array());
        lastFetchedMessageId = messagesReceived.last().id;
        if (messagesReceived.size < 100) break;

    }

    // TODO format the messages into a document and upload
    //const path = `./archives/${channel.id}.txt`;
    const path = `archives/${channel.id}.txt`;
    save(path, channel, channelMessages.reverse(), db_guild);

    // After the channel is archived, delete it if DELETE_AND_ARCHIVE is true
    if (db_guild.delete_mode == 1)
        channel.delete().catch(console.error());
}

function save(path, channel, messages, db_guild) {
    // Get time stamp and open file stream
    const date = new Date().toLocaleString('en-US', {timezone: 'EST'});
    const stream = fs.createWriteStream(path);

    // Write each message to file
    stream.on('open', function (fd) {
        stream.write(`Archive for channel ID #${channel.id} as of ${date}\n\n`);

        messages.forEach(message => {
            stream.write(`[${message.createdAt.toLocaleString('en-US', {timezone: 'EST'})}] ${message.author.tag}: ${message.content}\n`);
        });

        stream.end();

        // File written. Time to upload to Discord.
        console.timeEnd("lol");
        upload(path, channel, db_guild).catch(console.error);
    });
}

// Upload the transcript to the archive channel and delete the file on disk.
async function upload(path, channel, db_guild) {
    await client.channels.fetch(db_guild.channel_id).then(archiveChannel => archiveChannel.send({
        files: [{
            attachment: path,
            name: `${channel.name}.txt`
        }]
    }).catch(console.error));

    fs.unlink(path, function (err) {
        if (err)
            console.error(err);
    });
}

// Check if member has configured role or administrator permissions
function hasPermission(member) {
    record = db.getGuildRecord(member.guild.id);
    return member.roles.cache.some(role => role.id == record.role_id || role.permissions.has("ADMINISTRATOR"))
    return true;
}

// Get channel object from mention
function getChannelFromMention(mention) {
    if (!mention)
        return;

    if (mention.startsWith("<#") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        return client.channels.cache.get(mention);
    }
}

// Get role object from mention
function getRoleFromMention(mention, guild) {
    if (!mention) {
        return;
    }

    if (mention.startsWith("<@&") && mention.endsWith(">")) {
        mention = mention.slice(3, -1);

        return guild.roles.cache.get(mention);
    }
}

//TODO Setup Invite & Setup commands
//TODO Set a message limit for files to prevent non-uploadable files (Probably around 50k messages)
//TODO Set up a function to split archive requests larger than the limit above to create 2 or more files
// [After bot is pushed live]
//TODO Set up Discord server for the bot (Darryl)
//TODO Set up web page for the bot (Darryl)
//TODO Implement HTML file saving
//TODO Open source release (Final)