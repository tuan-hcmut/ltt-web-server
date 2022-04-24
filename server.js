const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listen on port 127.0.0.1:${port}`);
});
