/**
 * Created by mint-ghost on 8/21/15.
 */
var express = require('express');
var router = express.Router();
var soap = require('soap');
var url = 'http://192.168.101.235:8088/CommonService.svc?wsdl';
//var url = 'http://localhost:8186/CommonService.svc?wsdl';
var xml2js = require('xml2js');
/* GET home page. */

router.post('/', function (req, res, next) {
    res.send('');

});

module.exports = router;
