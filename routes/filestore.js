var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
var bcrypt = require("bcryptjs");
var sql = require("mssql");
let verifyToken = require('./verifytoken');
var dbconfig = require('./dbconfig');
const camelcaseKeys = require('camelcase-keys');
const multer = require("multer");
var localStorage = require('localStorage');
const upload = multer({
  dest: "./public/images"
});
//File Upload
router.post("/FileUpload/:id/:userId", verifyToken,
  upload.single("file"), (req, res) => {
    console.log(req.params.userId);
    const tempPath = req.file.path;
    const targetPath = path.join(path.dirname(tempPath), req.file.originalname);
    let folderId = req.params.id == 'Home' ? null : req.params.id;
    fs.rename(tempPath, targetPath, err => {
      if (err) return handleError(err, res);
      sql.connect(dbconfig.config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        var fillPathStore = "/public/images";
        let userId = req.params.userId;
        let sqlQuery = `INSERT INTO FileInfo( FileName,FileType,FileSize, FileVersion, FilePath,CreatedOn,CreatedBy,FolderId) 
                     VALUES('${req.file.originalname}','${req.file.mimetype}',${req.file.size},1,'${fillPathStore}','${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}',${userId},${folderId})`
        console.log(sqlQuery);
        request.query(sqlQuery, function (err, result) {
          if (err)
            return res.status(404).send({ error: 'Server error!' });
          console.log(err)

          console.log("Data added succesfully.");
          res.send("File added succesfully.");
        });
      });

    });

  }
);

router.get('/GetAllFiles', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.query('select * from FileInfo', function (err, result) {
      if (err) console.log(err)
      let folderData = [];
      request.query('select * from Folder where IsChildFolder = 0', function (err1, resultdata) {
        if (err1) console.log(err1)
        resultdata.recordset = camelcaseKeys(resultdata.recordset);
        folderData = resultdata.recordset;

        folderData.forEach(element => {
          element.fileName = element.folderName,
            element.isFolder = true
        });
        //  console.log(folderData);
        // res.send(result.recordset);
        result.recordset = camelcaseKeys(result.recordset);
        console.log(folderData.concat(result.recordset));
        constFinalArray = [...folderData, ...result.recordset]
        //  console.log(constFinalArray);
        res.send(constFinalArray);
      });


    });
  });
});


router.get('/GetFolderFileListById/:id', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);
    let fileQuery = req.params.id == 'Home' ? `select * from FileInfo where FolderId is null and CreatedBy = ${global.userId}` : `select * from FileInfo where FolderId = @id and CreatedBy = ${global.userId}`;
    let folderQuery = req.params.id == 'Home' ? `select * from Folder where IsChildFolder = 0 and CreatedBy = ${global.userId}` : `select * from Folder where ParentFolderId = @id and CreatedBy = ${global.userId}`;
    request.query(fileQuery, function (err, result) {

      if (err) console.log(err)
      let folderData = [];
      request.query(folderQuery, function (err1, resultdata) {
        if (err1) console.log(err1)
        if (resultdata.recordset.length > 0) {
          resultdata.recordset = camelcaseKeys(resultdata.recordset);
          folderData = resultdata.recordset;
          folderData.forEach(element => {
            element.fileName = element.folderName,
              element.isFolder = true
          });
        }
        let constFinalArray = [];
        let fileData = [];
        //  console.log(folderData);
        // res.send(result.recordset);
        if (result.recordset.length > 0) {
          result.recordset = camelcaseKeys(result.recordset);
          fileData = result.recordset;
          // console.log("FileData :" + fileData)
        }
        constFinalArray = [...folderData, ...fileData]
        // console.log(constFinalArray);

        //  console.log(constFinalArray);
        res.send(constFinalArray);
      });
    });
  });
});


//Folder Create
router.post('/FolderCreate', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    let folderId = req.body.folderId == 'Home' ? '' : req.body.folderId;
    let isChlidFolder = req.body.folderId == 'Home' ? false : true;
    var request = new sql.Request();
    let sqlQuery = `INSERT INTO Folder(FolderName, IsChildFolder,ParentFolderId,CreatedOn,CreatedBy) 
                            VALUES('${req.body.folderName}','${isChlidFolder}','${folderId}','${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}','${req.body.userId}')`
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).send({ error: 'Server error!' });
      }
      let dir = './public/images/' + req.body.folderName;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      res.send("Folder created succesfully.");
    });
  });
});

router.delete('/DeleteFile/:id/:fileName', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);
    request.query('DELETE FROM FileInfo WHERE  FileId = @id', function (err, result) {
      if (err) console.log(err);
      let file = './public/images/' + req.params.fileName;
      fs.unlink(file, (err) => {
        if (err) {
          console.error(err);
          return res.status(404).send({ error: 'Server error!' });
        }
        //file removed
      })
      res.send("File deleted succesfully.");
    });
  });
});

router.delete('/DeleteFolder/:id/:fileName', function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);


    var folderQuery = `WITH T(xParent, xChild)AS(SELECT ParentFolderId, FolderId FROM Folder WHERE ParentFolderId=${req.params.id} UNION ALL SELECT ParentFolderId, FolderId FROM Folder INNER JOIN T ON ParentFolderId=xChild) DELETE FROM FileInfo WHERE  FolderId IN (SELECT xChild FROM T);WITH T(xParent, xChild)AS(SELECT ParentFolderId, FolderId FROM Folder WHERE ParentFolderId=${req.params.id} UNION ALL SELECT ParentFolderId, FolderId FROM Folder INNER JOIN T ON ParentFolderId=xChild) DELETE FROM Folder WHERE FolderId =${req.params.id} or ParentFolderId IN (SELECT xParent FROM T)`
    console.log(folderQuery);
    request.query(folderQuery, function (err, result) {
      console
      if (err) console.log(err);
      let file = './public/images/' + req.params.fileName;
      // fs.unlink(file, (err) => {
      //   if (err) {
      //     console.error(err);
      //     return res.status(404).send({ error: 'Server error!' });
      //   }
      //   //file removed
      // })
      res.send("File deleted succesfully.");
    });
  });
});

router.put('/FolderRename', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let sqlQuery = `UPDATE Folder set FolderName = '${req.body.folderName}'  WHERE FolderId = '${req.body.folderId}'`
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {
      if (err) console.log(err)
      res.send("Folder renamed succesfully.");
    });
  });
});

router.put('/FileRename', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let sqlQuery = `UPDATE FileInfo set FileName = '${req.body.fileName}'  WHERE FileId = '${req.body.fileId}'`
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {


      if (err) console.log(err);
      let oldDir = './public/images/' + req.body.oldFileName;
      let newDir = './public/images/' + req.body.fileName;
      if (fs.existsSync(oldDir)) {
        fs.renameSync(oldDir, newDir);
      }
      res.send("File renamed succesfully.");
    });
  });
});

//Folder Create
router.post('/CommentAdd', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    let sqlQuery = `INSERT INTO Comment(UserId, FileId,Comment,CommentTime) 
                            VALUES('${req.body.userId}','${req.body.fileId}','${req.body.comment}','${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}')`
    console.log(sqlQuery);
    request.query(sqlQuery, function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).send({ error: 'Server error!' });
      }      
      res.send("Comment added succesfully.");
    });
  });
});

router.get('/GetCommentListById/:id', verifyToken, function (req, res, next) {
  sql.connect(dbconfig.config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    request.input('id', req.params.id);
    request.query('select * from Comment where FileId = @id', function (err, result) {
      if (err) console.log(err)     
        result.recordset = camelcaseKeys(result.recordset);             
        res.send(result.recordset);
    });
  });
});

module.exports = router;
