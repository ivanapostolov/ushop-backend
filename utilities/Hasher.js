const crypto = require('crypto');

class Hasher {
    generateSalt() {
        const length = 12;

        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    hash(pass, salt) {
        return crypto.createHmac('sha512', salt).update(pass).digest('hex');
    };

    compare(pass, salt, sample) {
        return pass === this.hash(sample, salt);
    }
}

module.exports = Hasher;