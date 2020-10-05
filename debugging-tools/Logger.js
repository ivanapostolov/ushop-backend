const fs = require("fs");

class Logger {
    static get path() {
        return __dirname + "/log.txt";
    }

    static now() {
        const now = new Date();

        return `${now.getDate()}/${now.getMonth() + 1
      }/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }

    static format(status, message) {
        return `${Logger.now()} ${status.toUpperCase()} : ${message} \n`;
    }

    static read() {
        return new Promise((resolve, reject) => {
            fs.readFile(Logger.path, "UTF8", (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    }

    static write(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(Logger.path, data, (err) => (err ? reject(err) : resolve()));
        });
    }

    static log(status, message) {
        fs.access(Logger.path, async(err) => {
            if (err) {
                Logger.write(Logger.format(status, message));
            } else {
                Logger.write((await Logger.read()) + Logger.format(status, message));
            }
        });
    }
}

module.exports = Logger;