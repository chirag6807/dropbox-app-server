var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
var bcrypt = require("bcryptjs");
var sql = require("mssql");
var dbconfig = require('./dbconfig');
const camelcaseKeys = require('camelcase-keys');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Get Method called.');
});


router.get('/GetAll/:id', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);
    request.query('select * from UserInfos where UserId != @id', function (err, result) {
      if (err) console.log(err)
      // console.log(result.recordset[0]);
      result.recordset = camelcaseKeys(result.recordset);
      res.send(result.recordset);
    });
  });
});

router.post('/Search', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query(`select * from Message where From_User_Id = '${req.body.fromUserId}' and To_User_Id = '${req.body.toUserId}' or From_User_Id ='${req.body.toUserId}' and To_User_Id = '${req.body.fromUserId}'`, function (err, result) {
      if (err) console.log(err)
      if (result.recordset) {
        result.recordset = camelcaseKeys(result.recordset);
      }
      // result.recordset = camelcaseKeys(result.recordset);
      res.send(result.recordset);
    });
  });
});

router.post('/SendMessage', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let sqlQuery = '';
    if (req.body.imageBaseData == null) {
      sqlQuery = `INSERT INTO Message(From_User_Id, To_User_Id, Message,IsRead) 
  VALUES('${req.body.fromUserId}','${req.body.toUserId}','${req.body.message}','false')`
    }
    else {
      sqlQuery = `INSERT INTO Message(From_User_Id, To_User_Id, Message,ImageBaseData,FileName,FileType,IsFile,IsRead) 
  VALUES('${req.body.fromUserId}','${req.body.toUserId}','${req.body.message}','${req.body.imageBaseData}','${req.body.fileName}','${req.body.fileType}','${req.body.isFile}','false')`
    }
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {
      if (err) console.log(err)
      console.log("Data added succesfully.");
      res.send("Data added succesfully.");
    });
  });
});

router.post('/ReadMessage', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let sqlQuery = `UPDATE Message SET IsRead = 1 WHERE From_User_Id = ${req.body.fromUserId} and To_User_Id = ${req.body.toUserId}`
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {
      if (err) console.log(err)
      res.send("Data updated succesfully.");
    });
  });
});


// Login api call
router.post('/login', function (req, res, next) {
  let userData = {
    username: req.body.username,
    password: req.body.password
  };
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    var quertString = `select * from UserInfos where UserName = '${req.body.username}'`;
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
      console.log(token);
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
    let encrryptPassword;
    console.log(req.body.password);
    bcrypt.hash(req.body.password, 8)
      .then(password => {
        encrryptPassword = password;
        console.log(encrryptPassword);
        var request = new sql.Request();
        let sqlQuery = `INSERT INTO UserInfos(UserName, Password) 
                      VALUES('${req.body.username}','${encrryptPassword}')`
        request.query(sqlQuery, function (err, result) {
          if (err) console.log(err)
          console.log("User added succesfully.");
          res.send("User added succesfully.");
        });
      });
  });
});


module.exports = router;
