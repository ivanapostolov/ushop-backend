const Logger = require("./debugging-tools/Logger");
const Database = require("./database/Database");
const express = require("express");

const apiRouter = require("./routes/api");
const authRouter = require("./routes/auth");

const app = express();

app.disable("etag");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

app.use(express.json());

app.use("/api", apiRouter);
app.use("/auth", authRouter);

app.use(express.static(__dirname + "/assets"));

const db = new Database();

const initialize = async () => {
  try {
    await db.dropAll();

    if (await db.doAllTablesExist()) {
      console.log("Everything is ready");
    } else {
      await db.createAll();
      console.log("Tables were created");
    }

    if (await db.doesUserExist('admin@admin.com')) {
      console.log("Admin exist");
    } else {
      await db.createAdmin();
    }
  } catch (e) {
    throw e;
  }
};

initialize()
  .then((res) => {
    //console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;

app.listen(port, () =>
  console.log(Logger.now() + ` Listening on port ${port}...`)
);
