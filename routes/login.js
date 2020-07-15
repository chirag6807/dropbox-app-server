var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
var bcrypt = require("bcryptjs");
var sql = require("mssql");
var dbconfig = require('./dbconfig');
const camelcaseKeys = require('camelcase-keys');
var localStorage = require('localStorage');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Get Method called.');
});


// Login api call
router.post('/login', function (req, res, next) {
  let userData = {
    username: req.body.email,
    password: req.body.password
  };
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var quertString = `select * from UserInfo where email = '${req.body.email}'`;
    request.query(quertString, function (err, result, next) {
      if (err)
        return res.status(500).send('Server error!');
      if (!result.recordset.length > 0)

        return res.status(404).send({ error: 'User not found!' });
      const data = bcrypt.compareSync(req.body.password, result.recordset[0].Password);
      if (!data)
        return res.status(401).send({ error: 'Password not valid!' });
      let token = jwt.sign(userData, global.config.secretKey, {
        algorithm: global.config.algorithm,
        expiresIn: '10m'
      });
     
      localStorage.setItem('userId', result.recordset[0].UserId);
      res.status(200).json({
        jwtoken: token,
        userName: result.recordset[0].UserName,
        userId: result.recordset[0].UserId
      });
    });
  });
});

//Add User
router.post('/AddUser', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var quertString = `select * from UserInfo where email = '${req.body.email}'`;
    request.query(quertString, function (err, result) {
      if (err)
        return res.status(500).send('Server error!');
      if (result.recordset.length > 0)
        return res.status(401).send({ error: 'User already avilable.' });
      sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        bcrypt.hash(req.body.password, 8)
          .then(password => {
            var request = new sql.Request();
            let sqlQuery = `INSERT INTO UserInfo(UserName, Password,Email,CreationDate,IsActive,FirstName,LastName) 
                            VALUES('${req.body.userName}','${password}','${req.body.email}','${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}','true','${req.body.firstName}','${req.body.lastName}')`
          
            request.query(sqlQuery, function (err, result) {
              if (err) console.log(err)
              res.send("User added succesfully.");
            });
          });
      });
    });
  });
  debugger
});

router.get('/GetUserById/:id', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);
    request.query('select * from UserInfo where UserId = @id', function (err, result) {
      if (err) console.log(err)
      // console.log(result.recordset[0]);
      result.recordset[0] = camelcaseKeys(result.recordset[0]);
      res.send(result.recordset[0]);
    });
  });
});

router.put('/UpdateUser', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
      if (err) console.log(err);
      var request = new sql.Request();   
      let sqlQuery =  req.body.dob!= null ? `UPDATE UserInfo set UserName = '${req.body.userName}', ProfilePath = '${req.body.profilePath}',
      Email = '${req.body.email}',Address = '${req.body.address}',DOB = '${new Date(req.body.dob).toISOString().replace(/T/, ' ').replace(/\..+/, '')}',
      FirstName = '${req.body.firstName}', LastName = '${req.body.lastName}'  WHERE UserId = '${req.body.userId}'` : `UPDATE UserInfo set UserName = '${req.body.userName}', ProfilePath = '${req.body.profilePath}',
      Email = '${req.body.email}',Address = '${req.body.address}',
      FirstName = '${req.body.firstName}', LastName = '${req.body.lastName}'  WHERE UserId = '${req.body.userId}'`; ;

      console.log(sqlQuery);
      request.query(sqlQuery, function (err, result) {
          if (err) console.log(err)
          res.send("User Profile updated succesfully.");
      });
  });
});



module.exports = router;
