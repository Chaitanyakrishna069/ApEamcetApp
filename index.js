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
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'ssshhhhh', resave: false, saveUninitialized: false, initialised: false }));
app.use((req, res, next) => {
  if (!req.session.initialised) {
    req.session.initialised = true;
    req.session.yeardata = '';
  }
  next();
});

app.get("/", (req, res) => {
  res.render('home');
});

app.get("/selection", (req, res) => {
  let { year, stream } = req.query;

  if (year) {
    req.session.yeardata = year;
    req.session.stream = stream;
  }
  res.render('selection');
});
app.get("/finder", async (req, res) => {
  let allclg;
  if (req.session.stream == 'engineering') {
    if (req.session.yeardata == '2019') {
      allclg = await eamcet2019.find({ branch_code: { "$nin": ["PHD", "PHM"] } }).select('inst_name -_id');
    } else if (req.session.yeardata == '2020') {
      allclg = await eamcet2020.find({ branch_code: { "$nin": ["PHD", "PHM"] } }).select('inst_name -_id');
    } else {
      allclg = await eamcet2020.find({ branch_code: { "$nin": ["PHD", "PHM"] } }).select('inst_name -_id');
    }
  }
  if (req.session.stream == 'pharmacy') {
    if (req.session.yeardata == '2019') {
      allclg = await eamcet2019.find({ branch_code: { "$in": ["PHD", "PHM"] } }).select('inst_name -_id');
    } else if (req.session.yeardata == '2020') {
      allclg = await eamcet2020.find({ branch_code: { "$in": ["PHD", "PHM"] } }).select('inst_name -_id');
    } else {
      allclg = await eamcet2020.find({ branch_code: { "$in": ["PHD", "PHM"] } }).select('inst_name -_id');
    }

  }
  let array = allclg.map(x => x.inst_name)
  let stream = req.session.stream;
  let clgarray = [...new Set(array)];
  res.render('finder', { clgarray, stream });
});

app.post("/finders", async (req, res) => {
  const { clgname, branchname, ctyname } = req.body;
  let data;
  let year = req.session.yeardata
  if (req.session.yeardata == '2019') {
    data = await eamcet2019.find({ inst_name: clgname, branch_code: branchname });
  } else if (req.session.yeardata == '2020') {
    data = await eamcet2020.find({ inst_name: clgname, branch_code: branchname });
  } else {
    data = await eamcet2020.find({ inst_name: clgname, branch_code: branchname });
  }
  res.render('showClose', { data, ctyname, year });
});
app.get("/findersClose/:id", async (req, res) => {
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
  let keys = Object.entries(data)
  data = keys
  res.render('moredetails', { data })
});

app.get("/findersPredict/:id", async (req, res) => {
  const { id } = req.params;
  let data;
  if (req.session.yeardata == '2019') {
    data = await eamcet2018.findById(id);
  } else if (req.session.yeardata == '2020') {
    data = await eamcet2019.findById(id);
  } else {
    data = await eamcet2020.findById(id);
  }
  data = data.toObject();
  let keys = Object.entries(data)
  data = keys
  res.render('moredetails', { data })
});

app.get("/predictor", async (req, res) => {
  let stream = req.session.stream;
  res.render('predictor', { stream });
});
app.post("/predictors", async (req, res) => {
  let { rank, branchname, ctyname } = req.body;
  let data;
  rank = parseInt(rank);
  let lowlim = rank - 5000
  let uplim = rank + 15000
  let year = req.session.yeardata
  if (req.session.yeardata == '2019') {
    data = await eamcet2018.find({ [ctyname]: { $gt: lowlim, $lt: uplim }, branch_code: branchname });
  } else if (req.session.yeardata == '2020') {
    data = await eamcet2019.find({ [ctyname]: { $gt: lowlim, $lt: uplim }, branch_code: branchname });
  } else {
    data = await eamcet2020.find({ [ctyname]: { $gt: lowlim, $lt: uplim }, branch_code: branchname });
  }
  let data2 = [];
  for (var i = 0; i < data.length; i++) {
    let val = [];
    val.push(data[i]["inst_name"])
    val.push(data[i]["branch_code"])
    if (data[i][[ctyname]] < rank) {
      val.push("Tough Chances")
    }
    else if (data[i][[ctyname]] > rank + 2000) {
      val.push("Good Chances")
    }
    else {
      val.push("Maybe")
    }
    val.push(data[i][[ctyname]])
    val.push(data[i]._id.toString())
    data2.push(val);
  }
  data2.sort(function (a, b) {
    return a[3] - b[3]
  });
  res.render('showPredict', { data2, year, rank });
});

app.get("/district", async (req, res) => {
  let { year } = req.query;
  if (year) {
    req.session.yeardata = year;
  }
  res.render('district');
});

app.post("/districtsNames", async (req, res) => {
  const { districtname } = req.body;
  var districts = {"ATP":"ANANTAPUR","CTR":"CHITTOOR","EG":"EAST GODAVARI","GTR":"GUNTUR","KRI":"KRISHNA","KNL":"KURNOOL","PKS":"PRAKASAM","SKL":"SRIKAKUALM","NLR":"NELLORE","VSP":"VISAKHAPATNAM","WG":"WEST GODAVARI","KDP":"KADAPA",};
  let data;
  let year = req.session.yeardata
  let stream = req.session.stream
  if (stream == "engineering") {
    if (req.session.yeardata == '2018') {
      data = await eamcet2018.find({ DIST: districtname, branch_code: { "$nin": ['PHD', 'PHM'] } });
    } else if (req.session.yeardata == '2019') {
      data = await eamcet2019.find({ DIST: districtname, branch_code: { "$nin": ['PHD', 'PHM'] } });
    } else {
      data = await eamcet2020.find({ DIST: districtname, branch_code: { "$nin": ['PHD', 'PHM'] } });

    }
  }
  else if (stream == "pharmacy") {
    if (req.session.yeardata == '2018') {
      data = await eamcet2018.find({ DIST: districtname, branch_code: { "$in": ['PHD', 'PHM'] } });
    } else if (req.session.yeardata == '2019') {
      data = await eamcet2019.find({ DIST: districtname, branch_code: { "$in": ['PHD', 'PHM'] } });
    } else {
      data = await eamcet2020.find({ DIST: districtname, branch_code: { "$in": ['PHD', 'PHM'] } });

    }
  }
  let newArray = [];
  for (let clg of data) {
    let newclg = {
      instName: clg.inst_name,
      place: clg.PLACE,
      instCode: clg.inst_code
    };
    newArray.push(newclg);
  }
  jsonObject = newArray.map(JSON.stringify);
  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  distName = districts[districtname]
  res.render('showDistricts', { data, uniqueArray, year,distName });
});
const port = 3000;
app.listen(port, () => {
  console.log("I am listening");
});