const Databse = require("../database/Database");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const tokens = require("../tokens");
const { request, response } = require("express");

const db = new Databse();

const authorize = (request, response, next) => {
    try {
        const token = request.body.token;

        if (token == null) {
            return response.status(401).json({ error: "Unauthorized Error" });
        }

        jwt.verify(token, tokens.secrets.access, (error, user) => {
            if (error) {
                return response.status(403).json({ error: "Forbidden Error" });
            } else {
                request.user = user;
            }
        });
    } catch (e) {
        throw new Error(e.message);
    }

    next();
}

//const addCategory = (name)

router.post("/add-category", authorize, (request, response) => {
    console.log(request.user);
    //const { mail, pass } = req.body;

    //db.select('Users', ['Password', 'Salt']);
});

router.post('/get-user-names', authorize, async(request, response) => {
    try {
        const email = request.user.email;

        console.log(email);

        const result = await db.select('Users', ['FirstName', 'LastName'], [{ Email: email }]);

        response.status(200).json({ fname: result.rows[0].firstname, lname: result.rows[0].lastname });
    } catch (e) {
        console.log(e.message);
        response.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;