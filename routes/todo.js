var express = require('express');
var router = express.Router();
let dbconfig = require('./dbconfig');
var sql = require("mssql");
const camelcaseKeys = require('camelcase-keys');



//Add Todo 
router.post('/AddToDo', function (req, res, next) {
    console.log(req.body);
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        let sqlQuery = `INSERT INTO ToDo(Description, Priority,IsCompleted) 
                        VALUES('${req.body.description}','${req.body.priority}','${req.body.isCompleted}')`
        request.query(sqlQuery, function (err, result) {
            if (err) console.log(err)
            res.send("ToDo added succesfully.");
        });
    });
});

router.get('/GetToDo', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.query('select * from ToDo', function (err, result) {
            if (err)
                return res.status(200).send('Server error!');
            if (!result.recordset.length > 0)

                return res.status(200).send({ error: 'Data not found!' });
            result.recordset = camelcaseKeys(result.recordset);
            res.send(result.recordset);
        });
    });
});

router.get('/GetById/:id', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('id', req.params.id);
        request.query('select * from ToDo where id = @id', function (err, result) {
            if (err) console.log(err)
            result.recordset[0] = camelcaseKeys(result.recordset[0]);
            res.send(result.recordset[0]);
        });
    });
});


router.put('/UpdateToDo', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();

        console.log(req.body);
        let sqlQuery = `UPDATE ToDo set Description = '${req.body.description}', 
        Priority = '${req.body.priority}',IsCompleted = '${req.body.isCompleted}'  WHERE id = '${req.body.id}'`;
        request.query(sqlQuery, function (err, result) {
            if (err) console.log(err)
            res.send("Data updated succesfully.");
        });
    });
});

router.delete('/Delete/:id', function (req, res, next) {
    sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('id', req.params.id);
        request.query('DELETE FROM ToDo WHERE  id = @id', function (err, result) {
            if (err) console.log(err)
            res.send("Data deleted succesfully.");
        });
    });
});

module.exports = router;