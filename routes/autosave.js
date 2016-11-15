/**
 * Created by hachicuong on 11-Jan-16.
 */
var express = require('express');
var router = express.Router();
var path=require('path');
var fs = require('fs');

router.post('/:type', function (req, res, next) {
    res.end('ok');

    var type=req.params.type;
    var recs = JSON.parse(req.body.recs);
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
        }

        delete rec['Client_item_detail'];
    }
    //var save_path=path.join(__dirname, '../autosave/',req.params.importdate,req.params.package,filename);
    var outputFilename =path.join(__dirname, '../autosave/',req.body.Username);
    console.log(outputFilename);
    fs.writeFile(outputFilename, JSON.stringify({type:type,recs:recs}, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFilename);
        }
    });
});
router.get('/', function (req, res, next) {
    var outputFilename =path.join(__dirname, '../autosave/',req.session.user.Username[0]);

    fs.readFile(outputFilename, "utf8", function(err, data) {
        if (err) throw err;
        res.write(data);
        res.end();
    });
});
module.exports = router;