var express = require('express');
var router = express.Router();
var pg=require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123456@192.168.101.174/NexGen';


router.get('/', function (req, res, next) {
    var client = new pg.Client(connectionString);

    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query('select p.*,COALESCE( hold, 0 ) as hold ,who_is_holding from ( select distinct(p.name),p.priority,count(*) from package p join document d on p.id=d.packageid join (select docid from plan_doc_keyer where lockedfinish=false or lockedfinish is null) as pl on pl.docid=d.id group by p.name,p.priority ) as p left join ( select distinct(p.name),count(*) as hold ,string_agg(lockedby, \', \') as who_is_holding from package p join document d on p.id=d.packageid join (select docid,concat(lockedby, \'(\',docid,\')\') as lockedby from plan_doc_keyer where (lockedfinish=false or lockedfinish is null) and lockedby is not null) as pl on pl.docid=d.id group by p.name,p.priority ) as p2 on p.name=p2.name  order by p.priority',
            function(err, result) {
            if(err) {
                return console.error('error running query', err);
            }
            //console.log(result.rows);
            // calculate estimation
            var sum_of_doc_pending=0;

            for(var i=0;i<result.rows.length;i++){
                sum_of_doc_pending+=parseInt(result.rows[i].count);
            }

            client.query('select count(*) from plan_doc_keyer where lockeddate>now()-interval \'15 minutes\' and lockedfinish=true',
                function(err2, result2) {
                    if(err2) {
                        return console.error('error running query', err2);
                    }
                    client.query('select pl.lockedby, count(*) from (select * from plan_doc_keyer pl where lockeddate>now()-interval \'120 minutes\' and lockedfinish=true) as pl left join doc_rsd rsd on rsd.docid=pl.docid  left join doc_upc upc on upc.docid=pl.docid left join doc_rin rin on rin.docid=pl.docid  left join doc_upc_rsd upc_rsd on upc_rsd.docid=pl.docid left join doc_rin_rsd rin_rsd on rin_rsd.docid=pl.docid  group by pl.lockedby  order by count desc limit 10',
                        function(err3, result3) {
                            if(err3) {
                                return console.error('error running query', err3);
                            }
                            console.log(result3);
                            // calculate estimation
                            var num_of_doc_processed=result2.rows[0].count;// in 15 minutes previous
                            var time_estimate=sum_of_doc_pending/(num_of_doc_processed/15);
                            var minutes_left=(time_estimate/60)-(time_estimate/60).toFixed(0);
                            res.render('package_backlog', {packages: result.rows,time_left:(time_estimate/60).toFixed(0)+' hrs '+(minutes_left*60).toFixed(2)+' m'
                                ,num_of_docs_pending:sum_of_doc_pending,top:result3.rows});// in minutes: time_estimate +' m ~ ' +
                            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                            client.end();
                        });
                    ////console.log(result2);
                    //// calculate estimation
                    //var num_of_doc_processed=result2.rows[0].count;// in 15 minutes previous
                    //var time_estimate=sum_of_doc_pending/(num_of_doc_processed/15);
                    //var minutes_left=(time_estimate/60)-(time_estimate/60).toFixed(0);
                    //res.render('package_backlog', {packages: result.rows,time_left:(time_estimate/60).toFixed(0)+' hrs '+(minutes_left*60).toFixed(2)+' m'
                    //    ,num_of_docs_pending:sum_of_doc_pending});// in minutes: time_estimate +' m ~ ' +
                    ////output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                    //client.end();
                });
            //res.render('package_backlog', {packages: result.rows});
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            //client.end();
        });
    });
    //res.end('OK');
    //if(req.session.user){
    //    res.redirect('key')
    //}
    //res.render('index', {title: 'NexGen Tool',last_username:''});
});
module.exports = router;
