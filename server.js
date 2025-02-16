const express = require("express");
const cors = require("cors");
// create a server instance
const app = express();

// trusted proxy for email controller
app.set("trust proxy", true);

// set costant to port
const port = process?.env.PORT || 3000;

//Other imports
const errorsHandler = require("./middlewares/errorsHandles");
const notFound = require("./middlewares/notFound");
const propertiesRouter = require("./routers/propertiesRouter");
const reviewsRouter = require("./routers/reviewsRouter");
const emailRouter = require("./routers/emailRouter");
const likesRouter = require("./routers/likesRouter");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// base url - homepage
app.get("/", (req, res) => {
    res.send("Home Page");
});

// routers
app.use("/api/properties", propertiesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/email", emailRouter);
app.use("/api/likes", likesRouter);
// handling errors and notFounds
app.use(errorsHandler);
app.use(notFound);

//server must listen on your host and your port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
