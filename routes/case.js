var express = require('express');
var router = express.Router();
let verifyToken = require('./verifytoken');
let dbconfig = require('./dbconfig');
var sql = require("mssql");
const camelcaseKeys = require('camelcase-keys');

router.get('/GetAll', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.query('select * from CaseInfos', function (err, result) {
            if (err) console.log(err)

            result.recordset = camelcaseKeys(result.recordset);

            // console.log(result.recordset);
            res.send(result.recordset);
        });
    });
});

router.post('/Search',verifyToken, function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        console.log(`select * from CaseInfos where name = '${req.body.name}' and city = '${req.body.city}'`)
        request.query(`select * from CaseInfos where name = '${req.body.name}' and city = '${req.body.city}'`, function (err, result) {
            if (err) console.log(err)
            result.recordset = camelcaseKeys(result.recordset);
            res.send(result.recordset);
        });
    });
});

router.get('/GetById/:id',verifyToken, function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('id', req.params.id);
        request.query('select * from CaseInfos where id = @id', function (err, result) {
            if (err) console.log(err)
            // console.log(result.recordset[0]);
            result.recordset[0] = camelcaseKeys(result.recordset[0]);
            res.send(result.recordset[0]);
        });
    });
});

router.post('/Save', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        let sqlQuery = `INSERT INTO CaseInfos(Name, Age, Gender, Address, City, Country, Status) 
                   VALUES('${req.body.name}','${req.body.age}','${req.body.gender}','${req.body.address}','${req.body.city}','${req.body.country}','${req.body.status}')`
        request.query(sqlQuery, function (err, result) {
            if (err) console.log(err)
            console.log("Data added succesfully.");
            res.send("Data added succesfully.");
        });
    });
});

router.put('/Update', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        let sqlQuery = `UPDATE CaseInfos set Name = '${req.body.name}', Age = '${req.body.age}',Gender = '${req.body.gender}',Address = '${req.body.address}',City = '${req.body.city}',Country = '${req.body.country}',Status ='${req.body.status}'  WHERE id = '${req.body.id}'`;
        request.query(sqlQuery, function (err, result) {
            if (err) console.log(err)
            console.log("Data updated succesfully.");
            res.send("Data updated succesfully.");
        });
    });
});

router.delete('/Delete/:id', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('id', req.params.id);
        request.query('DELETE FROM CaseInfos WHERE  id = @id', function (err, result) {
            if (err) console.log(err)
            console.log("Data deleted succesfully.");
            res.send("Data deleted succesfully.");
        });
    });
});

module.exports = router;
