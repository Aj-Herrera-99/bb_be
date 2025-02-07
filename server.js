const express = require("express");
const cors = require("cors")
// create a server instance
const app = express();

// set costant to port
const port = process?.env.PORT || 3000;

//Other imports
const errorsHandler = require("./middlewares/errorsHandles");
const notFound = require("./middlewares/notFound");
const postsRouter = require("./routers/postsRouter");

app.use(cors());
app.use(express.static("public"));

// base url - homepage
app.get("/", (req, res) => {
    res.send("Home Page");
});

// routers
app.use("/posts", postsRouter);

// handling errors and notFounds
app.use(errorsHandler);
app.use(notFound);

//server must listen on your host and your port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
