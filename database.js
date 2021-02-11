class DiscordDatabase {
    constructor(dao) { this.dao = dao; }

    createGuildEntry(guild_id) {
        this.dao.run(`INSERT INTO guilds VALUES(${guild_id}, NULL, NULL, 0)`)
    }

     getGuildRecord(guild_id) {
       return this.dao.get(`SELECT * FROM guilds WHERE guild_id = ?`, [guild_id])
    }

    setRoleId(guild_id, role_id) {
        this.dao.run(`UPDATE guilds SET role_id = ? WHERE guild_id = ?`, [role_id, guild_id]);
    }

    setChannelId(guild_id, channel_id) {
        this.dao.run(`UPDATE guilds SET channel_id = ? WHERE guild_id = ?`, [channel_id, guild_id]);
    }

    setDeleteMode(guild_id, delete_mode) {
        this.dao.run(`UPDATE guilds SET delete_mode = ?, WHERE guild_id = ?`, [delete_mode, guild_id])
    }

}

module.exports = DiscordDatabase;