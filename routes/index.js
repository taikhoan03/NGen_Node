var express = require('express');
var router = express.Router();
var soap = require('soap');
var url = 'http://192.168.101.235:8088/CommonService.svc?wsdl';

var xml2js = require('xml2js');
/* GET home page. */
router.get('/', function (req, res, next) {

    if(req.session.user){
        res.redirect('key')
    }
    res.render('index', {title: 'NexGen Tool',last_username:''});
});
router.post('/', function (req, res, next) {

    var args = {username: req.body.username,password:req.body.password};
    //soap.createClient(url, function(err, client) {
    //    client.MyFunction(args, function(err, result) {
    //        console.log(result);
    //    });
    //});
    soap.createClient(url, function(err, client) {
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            client.Login(args, function(err, result) {
                if(err) {
                    console.log(err);
                    res.end('Error');
                    return;
                }
                var jsuser;
                var parser = new xml2js.Parser();
                parser.parseString(result.LoginResult, function (err, result) {
                    if(err) {
                        console.log(JSON.stringify(err));
                        res.render('index', {title: 'NexGen Tool',loginmessage:'Your username or password is not existed!!!',last_username:req.body.username});
                        return;
                    }
                    jsuser = result;//JSON.stringify(result);
                    if(!jsuser.User.Username){
                        res.render('index', {title: 'NexGen Tool',loginmessage:'Your username or password is not existed!!!',last_username:req.body.username});

                    }else{

                        console.log(result);
                        req.session.user = jsuser.User;
                        res.redirect('key')
                    }
                });


            });
        }
    });

});
router.get('/logout', function (req, res, next) {
    if(!req.session.user){
        res.redirect('/');
        return;
    }

    soap.createClient(url, function(err, client) {
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            client.UnLock({username:req.session.user.Username}, function(err, result) {
                if(err)
                    console.log(err);
                req.session.destroy();
                res.redirect('/');

            });
        }

    });
});
router.get('/test', function (req, res, next) {
    res.send('<img src="http://localhost:3000/remote/63112291_1..jpg"/>');
});
module.exports = router;
