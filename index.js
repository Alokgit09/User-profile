const express = require("express");
const {Server} = require("socket.io");
const cors = require("cors");
require("./DB/Connect");
const path = require("path");
const { userSignedup, upload, blogUpload, userLogedIn, verifyToken } = require("./Controllers/LoginSignUp");
require('dotenv').config();
const Auth = require("./Middleware/Auth");
const userEditDetails = require("./Controllers/UsereditDetails");
const bodyParser = require('body-parser');
const userDeleteAcc = require("./Controllers/UserDeleteAcc");
const {getAlldata, updateuserAlladmin, DeleteuserbyAdmin} = require('./Controllers/GetandUpdateAdmin');
const Role = require("./Middleware/Roleauth");
const makeAdmin = require("./Controllers/MakeAdmin");
const { createBlogsbyAdmin, updatePostbyadmin, deleteBlogadmin } = require("./Controllers/CreateBlog");
const searchBlogs = require("./Controllers/SearchBlog");
const sendMessage = require("./Controllers/SendMessage");
const ChatList = require('./Controllers/ChatList');
let ejs = require('ejs');

const app = express();
const server = require('http').createServer(app);
const io = new Server(server);

// app.use(cors({
//   origin: "http://localhost:3000", // Adjust based on your frontend URL
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

const socketHandler = require('./SocketIo');
socketHandler(io);  // Initialize socket.io with the server
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
const port = 2020;
app.use(bodyParser.json());
// app.set("view engine", "ejs");
// app.set("views", path.resolve("./Views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// ✅ Serve the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// app.get('/chatBox/:userId', Auth, (req, res) => {
//   const userId = req.params.userId;
//   res.render('chatBox'); // Ensure 'chatBox.ejs' exists
// });

// app.get('/chatBox', (req, res) => {
//   const userId = req.user.id; // Get user ID from the authenticated request
//   res.render('chatBox', { userId });
// });



app.post("/signup", upload.single('image'), userSignedup);
app.post("/login", userLogedIn);

app.put('/useredit', upload.single('image'), Auth, userEditDetails);

app.delete("/userdelete", Auth, userDeleteAcc);

app.get('/getall', Auth, getAlldata);

app.put('/updateusers/:id', upload.single('image'), Auth, Role, updateuserAlladmin);

app.delete('/deleteuser/:id', Auth, Role, DeleteuserbyAdmin);

app.post('/make/:id', Auth, Role, makeAdmin);

app.get('/token', verifyToken);

app.post('/createblog', Auth, Role, blogUpload.single('image'), createBlogsbyAdmin);

app.put('/updateblog/:id', blogUpload.single('image'), Auth, Role, updatePostbyadmin);

app.delete('/deleteblog/:id', blogUpload.single('image'), Auth, Role, deleteBlogadmin);

app.get('/search/:slug', Auth, Role, searchBlogs);

app.post('/send-message', Auth, sendMessage);

app.get('/chatlist', Auth, ChatList);

server.listen(port, () => {
  console.log(`User Registration Listening on ${port}`);
});
