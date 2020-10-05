const { Pool, Client } = require("pg");

const pool = new Pool({
    user: "ekatte_user",
    host: "localhost",
    database: "ekatte_db",
    password: "ekatte_pass",
    port: "5432"
});

const sendDBQuery = async(query) => {
    try {
        return await pool.query(query);
    } catch (e) {
        console.log(e);
        throw new Error(`Error occured while executing SQL query: ${JSON.stringify(query)}`);
    }
}

const parameterize = (arr) => {
    if (Array.isArray(arr)) {
        return;
    }
}

class Databse {
    get tables() {
        return [{
            name: 'Categories',
            columns: [{
                name: 'Id',
                type: 'SERIAL',
                rules: 'PRIMARY KEY',
            }, {
                name: 'Name',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }],
        }, {
            name: 'Items',
            columns: [{
                name: 'Id',
                type: 'SERIAL',
                rules: 'PRIMARY KEY',
            }, {
                name: 'CategoryId',
                type: 'INT',
                rules: 'NOT NULL',
            }, {
                name: 'Name',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Amount',
                type: 'INT',
                rules: 'NOT NULL',
            }, {
                name: 'Gender',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Size',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Material',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Brand',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Color',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Price',
                type: 'FLOAT',
                rules: 'NOT NULL',
            }],
        }, {
            name: 'Orders',
            columns: [{
                name: 'Id',
                type: 'SERIAL',
                rules: 'PRIMARY KEY',
            }, {
                name: 'UserEmail',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }],
        }, {
            name: 'Reservations',
            columns: [{
                name: 'OrderId',
                type: 'INT',
                rules: 'NOT NULL',
            }, {
                name: 'ItemId',
                type: 'INT',
                rules: 'NOT NULL',
            }, {
                name: 'Amount',
                type: 'INT',
                rules: 'NOT NULL',
            }],
        }, {
            name: 'Users',
            columns: [{
                name: 'Email',
                type: 'VARCHAR(255)',
                rules: 'PRIMARY KEY',
            }, {
                name: 'Password',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'Salt',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'FirstName',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }, {
                name: 'LastName',
                type: 'VARCHAR(255)',
                rules: 'NOT NULL',
            }],
        }];
    }

    async create(table) {
        const sql = `CREATE TABLE ${table.name}(${table.columns.map(e => e.name + ' ' + e.type + ' ' + e.rules + ', ').reduce((a, b) => a + b).slice(0, -2)});`;

        try {
            return await sendDBQuery(sql);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async createAll() {
        return await Promise.all(this.tables.map(e => this.create(e)));
    }

    async drop(name) {
        const sql = `DROP TABLE ${name};`;

        try {
            return await sendDBQuery(sql);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async dropAll() {
        return await Promise.all(this.tables.map(e => this.drop(e.name)));
    }

    async doesTableExist(name) {
        const sql = `SELECT to_regclass($1);`;

        try {
            const result = await sendDBQuery({ text: sql, values: [name] });

            return result.rows[0].to_regclass ? true : false;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async doAllTablesExist() {
        const results = await Promise.all(this.tables.map(e => this.doesTableExist(e.name)));

        return results.every(Boolean);
    }

    async insert(name, values) {
        try {
            const sql = `INSERT INTO ${name} VALUES(${values.map((e, i) => '$' + (i + 1)).reduce((a, b) => a + ', ' + b)});`;

            return await sendDBQuery({ text: sql, values: values });
        } catch (e) {
            console.error({ Error: e.message });

            throw new Error(e.message);
        }
    }

    async select(table, columns, conditions) {
        if (this.tables.map(e => e.name).includes(table)) {
            let sql = `SELECT ${Array.isArray(columns) && columns.length ? columns.reduce((a, b) => a + ', ' + b) : '*'} FROM ${table}`;

            if (Array.isArray(conditions) && conditions.length > 0) {
                sql += ' WHERE ' + conditions.map((e, i) => `${Object.keys(e)[0]} = $${++i}`).reduce((a, b) => `${a}, ${b}`) + ';';
            }

            return await sendDBQuery(Array.isArray(conditions) ? { text: sql, values: conditions.map(e => Object.values(e)[0]) } : sql);
        } else {
            console.log({ err: "Error occured while selecting from databse" });
        }
    }

    async doesAdminExist() {
        const sql = `SELECT COUNT(1) FROM Users WHERE Email = 'user@admin.com'`;

        try {
            const result = await sendDBQuery(sql);

            return result.rows[0].count != 0;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async doesUserExist(email) {
        const sql = `SELECT COUNT(1) FROM Users WHERE Email = $1`;

        try {
            const result = await sendDBQuery({ text: sql, values: [email] });

            return result.rows[0].count != 0;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async createAdmin() {
        const sql = `INSERT INTO Users VALUES('admin@admin.com', 'ddd11801556540639b233f9070c6bc29bd353d91a32a9623253d4b643b914b6b32166efa1246cfcec7030b305cbe66189a0998ed3dd13dddd1f9af1cbd3c0e25', '7dfe07b69366', 'Admin', 'Admin');`;

        try {
            return await sendDBQuery(sql);
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = Databse;