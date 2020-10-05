const Databse = require("../database/Database");
const Hasher = require("../utilities/Hasher");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const db = new Databse();
const hs = new Hasher();

const tokens = require("../tokens");

let refreshTokens = [];

const authenticate = async(email, password) => {
    if (await db.doesUserExist(email)) {
        const user = (await db.select("Users", null, [{ Email: email }])).rows[0];

        return hs.compare(user.password, user.salt, password);
    } else {
        return false;
    }
};

const generateAccessToken = (email) => {
    return jwt.sign({ email: email }, tokens.secrets.access, { expiresIn: '20m' });
}

const generateRefreshToken = (email) => {
    return jwt.sign({ email: email }, tokens.secrets.refresh);
}

const handleSignIn = async(request, response) => {
    try {
        const { mail, pass } = request.body;

        if (await authenticate(mail, pass)) {
            const accessToken = generateAccessToken(mail);
            const refreshToken = generateRefreshToken(mail);

            refreshTokens.push(refreshToken);

            const record = await db.select('Users', ['FirstName', 'LastName'], [{ Email: mail }]);

            response.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                firstName: record.rows[0].firstname,
                lastName: record.rows[0].lastname
            });
        } else {
            response.status(401).json({ error: 'Invalid user email or password' });
        }
    } catch (e) {
        throw new Error(e.message);
    }
}

router.post("/sign-in", (request, response) => {
    handleSignIn(request, response).then(res => {
        //console.log(res);
    }).catch(err => {
        console.log(err);
    });
});

router.post("/token", (request, response) => {
    try {
        const refreshToken = request.body.token;

        if (refreshToken == null) {
            return response.status(401).json({ error: "Unauthorized Error" });
        }

        if (!refreshTokens.includes(refreshToken)) {
            return response.status(403).json({ error: "Forbidden Error" });
        }

        jwt.verify(refreshToken, tokens.secrets.refresh, (error, user) => {
            if (error) {
                return response.status(403).json({ error: "Forbidden Error" });
            } else {
                response.status(200).json({ accessToken: generateAccessToken(user.email) });
            }
        });
    } catch (e) {
        throw new Error(e.message);
    }
});

module.exports = router;