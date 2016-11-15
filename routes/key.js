/**
 * Created by hachicuong on 8/18/2015.
 */
var express = require('express');
var router = express.Router();
var client =require('../bin/db');
var fs = require('fs');
var xml2js = require('xml2js');
var path=require('path');
var soap = require('soap');
var js2xmlparser = require("js2xmlparser");
var pg=require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123456@192.168.101.174/NexGen';
//var url = 'http://192.168.101.235:8088/CommonService.svc?wsdl';
var url = 'http://localhost:8186/CommonService.svc?wsdl';

/* GET home page. */
router.get('/', function (req, res, next) {
    if(!req.session.doc_info){
        req.session.doc_info={
            num_of_doc:0,
            num_of_rec:0,
            num_of_discard:0,
            last_receipt:'NONE'
        };
    }

    if(!req.session.user){
        res.redirect('/');
        return;
    }


    var autosave_path =path.join(__dirname, '../autosave/',req.session.user.Username[0]);
    console.log(autosave_path);
    var can_load_autosave=false;
    fs.stat(autosave_path, function(err, stat) {
        if(err == null) {
            //console.log('File exists');
            can_load_autosave=true;
        } else if(err.code == 'ENOENT') {
            //fs.writeFile('log.txt', 'Some log\n');
        } else {
            //console.log('Some other error: ', err.code);
        }
    });
    var args = {username: req.session.user.Username,agent:'web'};
    soap.createClient(url, function(err, client) {
        if(err){
            console.log(err);
            //res.redirect('/')
        }else{
            client.Get_doc_for_keyer_with_agent(args, function(err, result) {
                if(err) {
                    console.log(err);
                    res.end('Error');
                    return;
                }
                //console.log(result);
                var jsson;
                var parser = new xml2js.Parser();
                parser.parseString(result.Get_doc_for_keyer_with_agentResult, function (err, result) {
                    if(err) {
                        console.log(err);
                        res.end('Error');
                        return;
                    }
                    jsson = result;//JSON.stringify(result);
                    //console.log(JSON.stringify(result));
                    if(!jsson.Document){
                        res.end('No more doc (^.^)');

                    }else{
                        var doc=jsson.Document;
                        //console.log(result);
                        //var testxml=loadXMLDoc();
                        //var host='http://192.168.101.174/Netool_pro/images/'+doc.Doc_path[0].substring(9,doc.Doc_path[0].length)+"/";
                        if(doc.Doc_name){
                            var extention=path.extname(doc.Doc_name[0]);
                            var imgs=[
                                doc.Doc_name,
                                doc.Image_2==null?null:doc.Image_2+'.'+extention,
                                doc.Image_3==null?null:doc.Image_3+'.'+extention,
                                doc.Image_4==null?null:doc.Image_4+'.'+extention,
                                doc.Image_5==null?null:doc.Image_5+'.'+extention,
                                doc.Image_6==null?null:doc.Image_6+'.'+extention,
                                doc.Image_7==null?null:doc.Image_7+'.'+extention,
                                doc.Image_8==null?null:doc.Image_8+'.'+extention,
                                doc.Image_9==null?null:doc.Image_9+'.'+extention
                            ];
                            var message="";
                            var script_message_changed_doctype="";
                            if(req.session.current_doctype==null || req.session.current_doctype!=doc.Doctype[0]){
                                message="You are working on "+doc.Doctype[0]+" package";
                            }
                            if(message!='')
                                script_message_changed_doctype="alert('"+message+"')";
                            req.session.current_doctype=doc.Doctype[0];
                            //extract package from doc_path
                            var package_name=doc.Doc_path[0].substring(9);
                            //console.log('aaaa '+doc.Doc_path[0].substring(9));
                            var result;
                            if(doc.Reset_by){
                                var reset_comment='';
                                if(doc.Reset_comment)
                                    reset_comment=doc.Reset_comment[0];
                                // get ranking info

                                result={title: 'NexGen Tool',imgs:imgs,ocr_data:'',
                                    //host:host,
                                    doc_info:doc,username:req.session.user.Username,
                                    last_receipt:req.session.doc_info.last_receipt,
                                    current_receipt:doc.Doc_name,
                                    num_of_discard:req.session.doc_info.num_of_discard,
                                    num_of_doc:req.session.doc_info.num_of_doc,
                                    num_of_rec:req.session.doc_info.num_of_rec,
                                    reset_by:doc.Reset_by[0],
                                    comment:reset_comment,
                                    comment_display:'block',
                                    script_message_changed_doctype:script_message_changed_doctype,
                                    package_name:package_name,
                                    can_load_autosave:can_load_autosave
                                };
                                //res.render('key', {title: 'NexGen Tool',imgs:imgs,ocr_data:'',
                                //    //host:host,
                                //    doc_info:doc,username:req.session.user.Username,
                                //    last_receipt:req.session.doc_info.last_receipt,
                                //    current_receipt:doc.Doc_name,
                                //    num_of_discard:req.session.doc_info.num_of_discard,
                                //    num_of_doc:req.session.doc_info.num_of_doc,
                                //    num_of_rec:req.session.doc_info.num_of_rec,
                                //    reset_by:doc.Reset_by[0],
                                //    comment:reset_comment,
                                //    comment_display:'block',
                                //    script_message_changed_doctype:script_message_changed_doctype,
                                //    package_name:package_name,
                                //    can_load_autosave:can_load_autosave
                                //});
                            }else{
                                result={title: 'NexGen Tool',imgs:imgs,ocr_data:'',
                                    //host:host,
                                    doc_info:doc,username:req.session.user.Username,
                                    last_receipt:req.session.doc_info.last_receipt,
                                    current_receipt:doc.Doc_name,
                                    num_of_discard:req.session.doc_info.num_of_discard,
                                    num_of_doc:req.session.doc_info.num_of_doc,
                                    num_of_rec:req.session.doc_info.num_of_rec,
                                    comment_display:'none',
                                    script_message_changed_doctype:script_message_changed_doctype,
                                    package_name:package_name,
                                    can_load_autosave:can_load_autosave
                                };
                                //res.render('key', {title: 'NexGen Tool',imgs:imgs,ocr_data:'',
                                //    //host:host,
                                //    doc_info:doc,username:req.session.user.Username,
                                //    last_receipt:req.session.doc_info.last_receipt,
                                //    current_receipt:doc.Doc_name,
                                //    num_of_discard:req.session.doc_info.num_of_discard,
                                //    num_of_doc:req.session.doc_info.num_of_doc,
                                //    num_of_rec:req.session.doc_info.num_of_rec,
                                //    comment_display:'none',
                                //    script_message_changed_doctype:script_message_changed_doctype,
                                //    package_name:package_name,
                                //    can_load_autosave:can_load_autosave
                                //});
                            }
                            var client = new pg.Client(connectionString);

                            client.connect(function(err) {
                                if(err) {
                                    return console.error('could not connect to postgres', err);
                                }
                                client.query('select pl.lockedby, count(*) from (select * from plan_doc_keyer pl where lockeddate>now()-interval \'120 minutes\' and lockedfinish=true) as pl left join doc_rsd rsd on rsd.docid=pl.docid  left join doc_upc upc on upc.docid=pl.docid left join doc_rin rin on rin.docid=pl.docid  left join doc_upc_rsd upc_rsd on upc_rsd.docid=pl.docid left join doc_rin_rsd rin_rsd on rin_rsd.docid=pl.docid  group by pl.lockedby  order by count desc limit 10',
                                    function(err3, result3) {
                                        if(err3) {
                                            return console.error('error running query', err3);
                                        }
                                        //console.log(result3);

                                        client.end();
                                        result.top=result3.rows;
                                        res.render('key', result);
                                    });
                            });

                        }else{
                            res.end('No more doc (^.^)');
                        }

                    }
                });


            });
        }

    });

    //var testxml=loadXMLDoc();
    //
    //});
    //res.send(testxml.CoordinateList.Page[0].Line[0]);
    //var imgs=['images/47673434_1..jpeg',''];
    //res.render('key', {title: 'NexGen Tool',imgs:imgs,doc_info:testxml.CoordinateList});

});

router.post('/save/:type', function (req, res, next) {
    var type=req.params.type;
    var args;
    var recs = JSON.parse(req.body.recs);
    if(req.session.doc_info){
        req.session.doc_info.last_receipt=req.body.Receipt_id;
        //update use_doc_info
        req.session.doc_info.num_of_doc++;
        req.session.doc_info.num_of_rec+=recs.length;
    }

    for(var i=0;i<recs.length;i++){
        var rec=recs[i];
        if(type.toLowerCase()=='rsd'){
            rec.Item_description=rec.Client_item_detail;
            delete rec['Description'];
        }else if(type.toLowerCase()=='upc'){
            rec.Upc_code=rec.Client_item_detail;
            delete rec['Description'];
        }else if(type.toLowerCase()=='rin'){
            rec.Item_number=rec.Client_item_detail;
            delete rec['Description'];
        }
        else if(type.toLowerCase()=='rin_rsd'){
            rec.Item_number=rec.Client_item_detail;

        }
        else if(type.toLowerCase()=='upc_rsd'){
            rec.Upc_code=rec.Client_item_detail;
            console.log(rec);
        }

        delete rec['Client_item_detail'];
    }

    if(type.toLowerCase()=='rsd'){
        var xml=js2xmlparser("ArrayOfRecord_RSD", {Record_RSD:recs});
        args={xml_record:xml,
            transaction_type:req.body.Transaction_type,
            documentid:req.body.Docid,
            keying_time:req.body.Keying_time_ms,
            username:req.body.Username,
            transaction_date:req.body.Transaction_date,
            transaction_time:req.body.Transaction_time,
            total_update:req.body.Total,
            comment:req.body.Comment
        };
    }else if(type.toLowerCase()=='upc'){
        var xml=js2xmlparser("ArrayOfRecord_UPC", {Record_UPC:recs});
        args={xml_record:xml,
            transaction_type:req.body.Transaction_type,
            documentid:req.body.Docid,
            keying_time:req.body.Keying_time_ms,
            username:req.body.Username,
            transaction_date:req.body.Transaction_date,
            transaction_time:req.body.Transaction_time,
            total_update:req.body.Total,
            comment:req.body.Comment
        };
    }else if(type.toLowerCase()=='rin'){
        var xml=js2xmlparser("ArrayOfRecord_RIN", {Record_RIN:recs});
        args={xml_record:xml,
            transaction_type:req.body.Transaction_type,
            documentid:req.body.Docid,
            keying_time:req.body.Keying_time_ms,
            username:req.body.Username,
            transaction_date:req.body.Transaction_date,
            transaction_time:req.body.Transaction_time,
            total_update:req.body.Total,
            comment:req.body.Comment
        };
    }
    //
    else if(type.toLowerCase()=='rin_rsd'){
        var xml=js2xmlparser("ArrayOfRecord_RIN_RSD", {Record_RIN_RSD:recs});
        args={xml_record:xml,
            transaction_type:req.body.Transaction_type,
            documentid:req.body.Docid,
            keying_time:req.body.Keying_time_ms,
            username:req.body.Username,
            transaction_date:req.body.Transaction_date,
            transaction_time:req.body.Transaction_time,
            total_update:req.body.Total,
            comment:req.body.Comment
        };
    }
    else if(type.toLowerCase()=='upc_rsd'){
        var xml=js2xmlparser("ArrayOfRecord_UPC_RSD", {Record_UPC_RSD:recs});
        args={xml_record:xml,
            transaction_type:req.body.Transaction_type,
            documentid:req.body.Docid,
            keying_time:req.body.Keying_time_ms,
            username:req.body.Username,
            transaction_date:req.body.Transaction_date,
            transaction_time:req.body.Transaction_time,
            total_update:req.body.Total,
            comment:req.body.Comment
        };
    }
    //console.log(js2xmlparser("ArrayOfRecord_RSD", {Record_RSD:recs}));
    //var argse={xml_record:'',
    //    transaction_type:req.body.Transaction_type,
    //    documentid:req.body.Docid,
    //    keying_time:req.body.Keying_time_ms,
    //    username:req.body.Username,
    //    transaction_date:req.body.Transaction_date,
    //    transaction_time:req.body.Transaction_time,
    //    total_update:req.body.Total,
    //    comment:req.body.Comment
    //};
    //soap.createClient(url2, function(err, client) {
    //    client.MyFunction(args, function(err, result) {
    //        console.log(result);
    //    });
    //});
    soap.createClient(url, function(err, client) {
        if(err){
            console.log(err);
            res.end('OK');
        }else{
            client.Insert_records_with_comment(args, function(err, result) {
                if(err)
                    console.log(err);

                res.end('OK');
                remove_autosave_file(req.body.Username);

            });
        }

    });
    //setTimeout(function(){res.send('OK');},10);
});
router.post('/discard', function (req, res, next) {
    req.session.doc_info.num_of_discard++;
    var args={
        docid:req.body.docid,
        docnum:0,
        description:req.body.description,
        username_discard:req.session.user.Username[0]
    }
    soap.createClient(url, function(err, client) {
        if(err){
            console.log(err);
            res.end('OK');
        }else{
            client.discard_doc_keyer(args, function(err, result) {
                if(err)
                    console.log(err);

                res.end('OK');
                remove_autosave_file(req.session.user.Username[0]);

            });
        }

    });

});
var returnJSONResults = function(baseName, queryName) {
    var XMLPath = "./public/images/25516.xml";
    console.log(XMLPath);
    loadXMLDoc(XMLPath);

};
var remove_autosave_file=function(username){
    var autosave_path =path.join(__dirname, '../autosave/',username);
    if(fs.existsSync(autosave_path)){
        fs.unlinkSync(autosave_path);
    }
}
function loadXMLDoc() {
    var filePath = "./public/images/47673434_1..xml";
    var json;
    try {

        var fileData = fs.readFileSync(filePath, 'utf-8');

        var parser = new xml2js.Parser();
        parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
            json = result;//JSON.stringify(result);
            console.log(JSON.stringify(result));
        });

        console.log("File '" + filePath + "/ was successfully read.\n");
        return json;
    } catch (ex) {console.log(ex)}
}
module.exports = router;
