require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const eamcet2018 = require('./models/eamcet2018');
const eamcet2019 = require('./models/eamcet2019');
const eamcet2020 = require('./models/eamcet2020');
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

//including this is very important to work req.body
app.use(express.urlencoded({ extended: true }));

app.use(session({secret: 'ssshhhhh',resave:false,saveUninitialized:false,initialised:false}));

//middle ware for saving a session when refresh takes palce
app.use((req, res, next) => {
  // Check if we've already initialised a session
  if (!req.session.initialised) {

     // Initialise our variables on the session object (that's persisted across requests by the same user
     req.session.initialised = true;
     req.session.yeardata = '';
    }
  next();
});

app.get("/",(req, res) => {
    res.render('home'); 
  });

  app.get("/finder",async (req, res) => {
    let {year} = req.query;
    let allclg;
    if(year){
      req.session.yeardata = year;
    }
    if (req.session.yeardata == '2018') {
      allclg = await eamcet2018.find({}).select('inst_name -_id');
    } else if (req.session.yeardata == '2019') {
      allclg = await eamcet2019.find({}).select('inst_name -_id');
    } else {
      allclg = await eamcet2020.find({}).select('inst_name -_id');
    }
    let array = allclg.map(x => x.inst_name)

    // let changearr = array.map(x =>x.replace(/ /g, ""))

    //to remove duplicates
    let clgarray = [...new Set(array)];
    res.render('finder',{clgarray});
  });

  app.post("/finders",  async(req, res) => {
      const {clgname,branchname,ctyname} = req.body;
      let data;
      let year = req.session.yeardata
      if (req.session.yeardata == '2018') {
        data = await eamcet2018.find({ inst_name: clgname, branch_code: branchname});
      } else if (req.session.yeardata == '2019') {
        data = await eamcet2019.find({ inst_name: clgname, branch_code: branchname});
      } else {
        data = await eamcet2020.find({ inst_name: clgname, branch_code: branchname});
      }
      // const rank = data[0][ctyname];
      res.render('show',{data,ctyname,year});
  });

  app.get("/finders/more",(req, res) => {
    res.render('moredetails');
  });
  app.get("/finders/:id", async (req, res) =>{
    const { id } = req.params;
    let data;
    if (req.session.yeardata == '2018') {
      data = await eamcet2018.findById(id);
    } else if (req.session.yeardata == '2019') {
      data = await eamcet2019.findById(id);
    } else {
      data = await eamcet2020.findById(id);
    }

    data = data.toObject();
    let keys = Object.entries(data);
    
    // data = Object.entries(data).map(([key, value]) => ({key,value}));
    //very important
    //reff: https://stackoverflow.com/questions/33849453/express-js-how-to-convert-an-array-to-an-object
    data = keys
    res.render('moredetails',{data})
  });
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("I am listening");
  });