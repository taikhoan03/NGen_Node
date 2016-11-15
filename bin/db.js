/**
 * Created by hachicuong on 8/18/2015.
 */
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:P0$treOffy!@192.168.101.253:5432/detool_v2_pro';

//var client = new pg.Client(connectionString);

module.exports=new pg.Client(connectionString);
