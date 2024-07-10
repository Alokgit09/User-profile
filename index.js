const express = require("express");
require("./DB/Connect");
const { userSignedup, upload, userLogedIn, verifyToken } = require("./Controllers/LoginSignUp");
require('dotenv').config();
const Auth = require("./Middleware/Auth");
const userEditDetails = require("./Controllers/UsereditDetails");
const bodyParser = require('body-parser');
const userDeleteAcc = require("./Controllers/UserDeleteAcc");
const {getAlldata, updateuserAlladmin, DeleteuserbyAdmin} = require('./Controllers/GetandUpdateAdmin');
const Role = require("./Middleware/Roleauth");
const makeAdmin = require("./Controllers/MakeAdmin");


const app = express();
app.use(express.json());
const port = 2020;
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h2>This is User Registration Form</h2>");
});

app.post("/signup", upload.single('image'), userSignedup);
app.post("/login", userLogedIn);

app.put('/useredit', upload.single('image'), Auth, userEditDetails);

app.delete("/userdelete", Auth, userDeleteAcc);

app.get('/getall', Auth, getAlldata);

app.put('/updateusers/:id', upload.single('image'), Auth, Role, updateuserAlladmin);

app.delete('/deleteuser/:id', Auth, Role, DeleteuserbyAdmin);

app.post('/make/:id', Auth, Role, makeAdmin);

app.get('/token', verifyToken);

app.listen(port, () => {
  console.log(`User Registration Listening on ${port}`);
});
