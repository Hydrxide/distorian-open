const sql = require("sqlite3").verbose();

class DiscordDAO {
    constructor() {
        this.db = new sql.Database("./bot.sqlite", sql.OPEN_READWRITE | sql.OPEN_CREATE, (err) => {
            if (err)
                console.error(err);
        });

        this.db.run(`CREATE TABLE IF NOT EXISTS guilds(guild_id INTEGER NOT NULL, channel_id TEXT DEFAULT NULL, role_id TEXT DEFAULT NULL, delete_mode INTEGER DEFAULT 0);`)
    }

    run(sql, params = []) {
        this.db.run(sql, params, (err) => {
            if (err) {
                console.error(err);
                console.error("Error on query: " + sql);
            }
        })
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if(err) {
                    console.error(err);
                    console.error("Error on query: " + sql);
                    reject(err);
                } else {
                    resolve(row);
                }
            })
        })
    }
}

module.exports = DiscordDAO;