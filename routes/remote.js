/**
 * Created by mint-ghost on 8/19/15.
 */
var express = require('express');
var router = express.Router();
var Client = require('ftp');
var path=require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var JSFtp = require("jsftp");
var config={
    host:'192.168.101.253',
    user:'detoolv2',
    password:'UrgRu1',
    connTimeout:30*1000,//How long (in milliseconds) to wait for the control connection to be established. Default: 10000
    pasvTimeout:30*1000,//How long (in milliseconds) to wait for a PASV data connection to be established. Default: 10000
    keepalive:30*1000//How often (in milliseconds) to send a 'dummy' (NOOP) command to keep the connection alive. Default: 10000
};


// connect to localhost:21 as anonymous
//
router.get('/:importdate/:package/:name/:type', function (req, res, next) {
    // link shoud like:
    // http://localhost:3000/remote/20150819/RSD_2015-08-19_7755bed35f6f/63142453_1..jpeg
    if(!req.session.user){
        res.send('');
        return;
    }

    var type=req.params.type;
    if(type.toLowerCase()!='xml')
        res.writeHead(200, {'Content-Type': 'image/gif' });
    else
        res.writeHead(200, { 'Content-Type': 'application/json' });
    var filename=req.params.name;
    var extention=path.extname(filename);
    var save_path=path.join(__dirname, '../public/images',req.params.importdate,req.params.package,filename);
    if(type.toLowerCase()=='xml'){
        save_path=path.join(__dirname, '../public/images',req.params.importdate,req.params.package,filename.replace(extention,'.xml'));
    }
    var folder_date=path.join(__dirname, '../public/images',req.params.importdate);
    var folder_package=path.join(__dirname, '../public/images',req.params.importdate,req.params.package);
    if (!fs.existsSync(folder_date)){
        fs.mkdirSync(folder_date);
    }
    if (!fs.existsSync(folder_package)){
        fs.mkdirSync(folder_package);
    }
    fs.exists(save_path,function(exists){
        if(exists){
            if(type.toLowerCase()!='xml'){
                var img = fs.readFileSync(save_path);
                res.end(img, 'binary');
            }else{
                var img = fs.readFileSync(save_path);
                var jsson;
                var parser = new xml2js.Parser();
                parser.parseString(img, function (err, result) {
                    jsson = result;//JSON.stringify(result);
                    //console.log(JSON.stringify(result));
                    res.end(JSON.stringify(jsson),'utf-8');
                });

            }

            //for test
            // remove this file
            //fs.unlink(save_path);
        }else{
            //var config={
            //    host:'192.168.101.253',
            //    user:'detoolv2',
            //    password:'UrgRu1',
            //    connTimeout:30*1000,//How long (in milliseconds) to wait for the control connection to be established. Default: 10000
            //    pasvTimeout:30*1000,//How long (in milliseconds) to wait for a PASV data connection to be established. Default: 10000
            //    keepalive:30*1000//How often (in milliseconds) to send a 'dummy' (NOOP) command to keep the connection alive. Default: 10000
            //};
            var ftp = new JSFtp({
                host: '192.168.101.253',
                port: 21,
                user: 'detoolv2',
                pass: 'UrgRu1',
                debugMode: false
            });


            ftp.on('error', function(err){
                console.log('onFTPError: ' + err)
            });
            if(type.toLowerCase()!='xml'){
                ftp.get('Resource/IMG/'+req.params.importdate+'/'+req.params.package+'/'+filename, save_path, function(hadErr) {
                    if (hadErr)
                    {
                        console.error('There was an error retrieving the file.');
                        fs.stat(save_path, function(err, stat) {
                            if(err == null) {
                                //console.log('File exists');
                                fs.unlink(save_path);
                            } else if(err.code == 'ENOENT') {
                                //fs.writeFile('log.txt', 'Some log\n');
                                res.end('');
                                return;
                            } else {
                                //console.log('Some other error: ', err.code);
                            }
                        });
                    }
                    else{
                        //console.log('File copied successfully!');
                        var img = fs.readFileSync(save_path);
                        res.end(img, 'binary');
                    }
                    ftp.raw.quit(function(err, data) {
                        if (err){
                            console.error('ftp quit error: ' + err);
                        } else {
                            //console.log('server closed')
                        }
                    })

                });
            }else{
                filename=filename.replace(extention,'.xml');
                ftp.get('Resource/OCR/'+req.params.importdate+'/'+req.params.package+'/'+filename, save_path, function(hadErr) {
                    if (hadErr){
                        console.error('There was an error retrieving the file.');
                        ftp.raw.quit(function(err, data) {
                            if (err){
                                console.error('ftp quit error: ' + err);
                            } else {
                                console.log('server closed')
                            }
                        });
                        fs.stat(save_path, function(err, stat) {
                            if(err == null) {
                                //console.log('File exists');
                                fs.unlink(save_path);
                            } else if(err.code == 'ENOENT') {
                                //fs.writeFile('log.txt', 'Some log\n');
                                res.end('');
                                return;
                            } else {
                                //console.log('Some other error: ', err.code);
                            }
                        });

                    }else{
                        fs.stat(save_path, function(err, stat) {
                            if(err == null) {
                                //console.log('File exists');
                                //var xml_ocr = fs.readFileSync(save_path);
                                ftp.raw.quit(function(err, data) {
                                    if (err){
                                        console.error('ftp quit error: ' + err);
                                    } else {
                                        //console.log('server closed')
                                    }
                                });
                                fs.readFile(save_path, "utf8", function(err, data) {
                                    if (!err){
                                        var xml_ocr=data;
                                        var parseString = xml2js.parseString;
                                        parseString(xml_ocr, function (err_parse, result) {
                                            if(err_parse){
                                                console.log(err_parse);
                                                res.end();
                                                return;
                                            }
                                            res.write(JSON.stringify(result));
                                            res.end();
                                        });
                                    }
                                });

                            } else if(err.code == 'ENOENT') {
                                //fs.writeFile('log.txt', 'Some log\n');
                                //res.end('');
                                //return;
                            } else {
                                //console.log('Some other error: ', err.code);
                            }
                        });


                    }
                });
            }

            //var c = new Client();
            //
            //c.on('ready', function() {
            //    if(type.toLowerCase()!='xml'){
            //        c.get('Resource/IMG/'+req.params.importdate+'/'+req.params.package+'/'+filename, function(err, stream) {
            //            if (err) {
            //                console.log(err);
            //                return;
            //            }
            //            stream.once('close', function() { c.end(); });
            //            var file=fs.createWriteStream(save_path);
            //            file.on('finish',function(){
            //                var img = fs.readFileSync(save_path);
            //                //res.writeHead(200, {'Content-Type': 'image/gif' });
            //                c.end();
            //                res.end(img, 'binary');
            //
            //            }).on('error', function(err) { // Handle errors
            //                fs.unlink(save_path); // Delete the file async. (But we don't check the result)
            //                c.end();
            //            });
            //            stream.pipe(file);
            //
            //
            //        });
            //    }else{
            //        filename=filename.replace(extention,'.xml');
            //        c.get('Resource/OCR/'+req.params.importdate+'/'+req.params.package+'/'+filename, function(err, stream) {
            //            if (err) {
            //                console.log(err);
            //                return;
            //            }
            //
            //            stream.once('close', function() { c.end(); });
            //
            //            var file=fs.createWriteStream(save_path);
            //
            //            file.on('finish',function(){
            //                stream.destroy();
            //                var img = fs.readFileSync(save_path);
            //                var jsson;
            //                var parser = new xml2js.Parser();
            //                parser.parseString(img, function (err, result) {
            //                    jsson = result;//JSON.stringify(result);
            //                    //console.log(JSON.stringify(result));
            //
            //                });
            //                res.end(JSON.stringify(jsson),'utf-8');
            //                c.end();
            //            }).on('error', function(err) { // Handle errors
            //                fs.unlink(save_path); // Delete the file async. (But we don't check the result)
            //                c.end();
            //            });
            //            stream.pipe(file);
            //
            //
            //        });
            //    }
            //
            //});
            //
            //c.connect(config);
        }

    });
    //res.send('ggg');

});

module.exports = router;