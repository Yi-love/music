var express = require('express');
var router = express.Router();
var path = require('path');
var music = path.join(__dirname , '../public/music');
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res) {
	fs.readdir( music , function(err , muscis){
		if (err){
			console.log(err);
		}else{
			res.render('index', { muscis : muscis });
		}
	});
 
});

module.exports = router;
