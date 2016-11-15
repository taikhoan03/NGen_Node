/**
 * Created by hachicuong on 8/18/2015.
 */
var $info=$('#info'),
    $entity=$('#entity');
var ocr_data={};
var img_drawing_name='img-drawing';
var canvas=document.getElementById(img_drawing_name);
var ctx=canvas.getContext("2d");
var percent=1;
var transaction_type;
var d=new Date();
var keying_time;
var degrees=0;
var image=document.getElementById("img");
var copied_record;
var is_show_ruler=true;
var autocomplete_upc_index=-1;
var autocomplete_source=[];
var autocomplete_source_elements=[];
var current_x_point=0;
function drawRotated(degrees){
    var img=document.getElementById("img");

    if(degrees==0){
        ctx.restore();

        canvas.width=img.width*2;
        canvas.height=img.height*2;
        ctx.drawImage(img,0,0);
    }else{
        ctx.restore();
        canvas.width=img.height*2;
        canvas.height=img.width*2;
        ctx.drawImage(img,0,0);
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    ctx.save();

    // move to the center of the canvas
    //ctx.translate(canvas.width/2,canvas.height/2);
    ctx.translate(canvas.width/6,canvas.height/6);
    //if(degrees==180)
    //    ctx.translate(canvas.width/10,canvas.height/10);
    //else
    //    ctx.translate(canvas.width/4,canvas.height/4);
    // rotate the canvas to the specified degrees
    ctx.rotate(degrees*Math.PI/180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    ctx.drawImage(image,-canvas.width/4,-canvas.height/4);

    // we’re done with the rotating so restore the unrotated context
    //ctx.restore();
}
window.onbeforeunload = function (e) {
    e = e || window.event;
    // For IE and Firefox prior to version 4
    if (e) {

        e.returnValue = 'Do you want to quit?';
    }
    // For Safari
    return 'Do you want to quit?';
};
$(document).ready(function(){
    var $notify_zone=$('#save-record-title>div');//$('#save-record-zone');
    var backcolor=$notify_zone.css('background-color');
    var mousePos = {}, offset = $("#"+img_drawing_name).offset();
    var $right_form=$('#right-panel form');
    var $transaction_type=$('#transaction_type');
    $('#left-panel-parent').height($(document).height()-$('#left-panel-parent').position().top-15);

    $('#img').attr('src','../remote/'+doc_info.Doc_path+'/'+doc_info.Doc_name+'/img').load(function(){
        var img=document.getElementById("img");
        canvas.width=img.width;
        canvas.height=img.height;
        ctx.drawImage(img,0,0);
    });
    $.get('../remote/'+doc_info.Doc_path+'/'+doc_info.Doc_name+'/xml',function(data,err){

        ocr_data=data.CoordinateList;
    });
    reload_imgs();
    function reload_imgs(){
        $('.div_hide').remove();
        var div_hide=$('<div class="div_hide">').css('display','none');
        for(var i=0;i<imgs.length;i++){

            var img_hide=$('<img>').css('display','none').attr('src','../remote/'+doc_info.Doc_path+'/'+imgs[i]+'/img');
            div_hide.append(img_hide);
        }
        $('body').append(div_hide);
    }
    // button events

    $('#btn-save').click(function(e){
        if(!confirm('Confirm save??')){
            return;
        }
        var msg=$.featherlight($('#msg_saving'), {resetCss:     false,persist:      true});
        msg.open();
        $('#btn-add').click();
        var recs=$('#save-record-main-content>div:last .rec');
        var rs = new Array();
        keying_time=(new Date())-d;
        recs.each(function(i,item){
            var rec=$(item);
            var record={
                Id:0,
                Docid:rec.find('#Docid').val(),
                Transaction_Type:rec.find('#Transaction_Type').val(),
                Transaction_Date:'2015-06-02T00:00:00',//rec.find('#Transaction_Date').val(),
                Description:rec.find('#Description').length>0?rec.find('#Description').first().val().toUpperCase():null,
                Sr_No:rec.find('#Sr_No').val(),
                Type:rec.find('#Item_type').val(),
                Qty:rec.find('#Qty').val(),
                Price:rec.find('#Price').val(),
                Per_Item:rec.find('#Per_Item').val(),
                Role_author:rec.find('#Role_author').val(),
                Item_type:rec.find('#Item_type').val(),
                Client_item_detail:rec.find('#Client_item_detail').val().toUpperCase()
            };
            rs.push(record);
        });


        if(rs.length<=0){
            alert('No records to save!!!');
            e.preventDefault();
            return;
        }
        $.post('key/save/'+$('#form-edit-zone1 #transaction_type').val().replace('/',"_"),{recs:JSON.stringify(rs),
            Transaction_type:$('#form-edit-zone1 #transaction_type').val(),
            Docid:parseInt(doc_info.Id[0]),
            Keying_time_ms:keying_time,//miliseconds
            //Username:
            Transaction_date:$right_form.find('#transaction-date').val(),
            Transaction_time:$right_form.find('#transaction-time').val().toUpperCase(),
            Total:$right_form.find('#total-input').val(),
            Username:JSON.parse(username)[0],
            Receipt_id:imgs[0][0],
            Comment:$("#txtComment").val()
        },function(data){

            if(data=='OK'){
                window.onbeforeunload = null;
                window.location.href=window.location.href;

            }
        }).fail(function() {
            alert( "error" );
        })  .always(function() {
            //window.location.href=window.location.href;
        });

    });
    $('#btn-add').click(function(e){
        //// Rin
        //var record={
        //    Docid:'',
        //    Transaction_Type:'',
        //    Total:'',
        //    Transaction_Date:'',
        //    Sr_No:'',
        //    Type:'',
        //    Qty:'',
        //    Price:'',
        //    Per_Item:'',
        //    Item_type:'',
        //    Role_author:'Keyer',
        //    Item_number:''
        //};
        //// RSD
        //var record={
        //    Docid:'',
        //    Transaction_Type:'',
        //    Total:'',
        //    Transaction_Date:'',
        //    Sr_No:'',
        //    Type:'',
        //    Qty:'',
        //    Price:'',
        //    Per_Item:'',
        //    Item_type:'',
        //    Role_author:'Keyer',
        //    Item_description:''
        //};
        //// UPC
        //var record={
        //    Docid:'',
        //    Transaction_Type:'',
        //    Total:'',
        //    Transaction_Date:'',
        //    Sr_No:'',
        //    Type:'',
        //    Qty:'',
        //    Price:'',
        //    Per_Item:'',
        //    Item_type:'',
        //    Role_author:'Keyer',
        //    Upc_code:''
        //};
        var _price=$("#price").val();
        if(_price.indexOf('.')==0)
            $("#price").val(0+_price);
        $right_form.submit();
        $right_form.find('#description').val('');
        // post autosave
        var recs=$('#save-record-main-content>div:last .rec');
        var rs = new Array();
        keying_time=(new Date())-d;
        recs.each(function(i,item){
            var rec=$(item);
            var record={
                Id:0,
                Docid:rec.find('#Docid').val(),
                Transaction_Type:rec.find('#Transaction_Type').val(),
                Transaction_Date:'2015-06-02T00:00:00',//rec.find('#Transaction_Date').val(),
                Description:rec.find('#Description')?null:rec.find('#Description').val().toUpperCase(),
                Sr_No:rec.find('#Sr_No').val(),
                Type:rec.find('#Item_type').val(),
                Qty:rec.find('#Qty').val(),
                Price:rec.find('#Price').val(),
                Per_Item:rec.find('#Per_Item').val(),
                Role_author:rec.find('#Role_author').val(),
                Item_type:rec.find('#Item_type').val(),
                Client_item_detail:rec.find('#Client_item_detail').val().toUpperCase()
            };
            rs.push(record);
        });


        if(rs.length<=0){
            alert('No records to save!!!');
            e.preventDefault();
            return;
        }
        $.post('autosave/'+$('#form-edit-zone1 #transaction_type').val().replace('/',"_"),{recs:JSON.stringify(rs),
            Transaction_type:$('#form-edit-zone1 #transaction_type').val(),
            Docid:parseInt(doc_info.Id[0]),
            Keying_time_ms:keying_time,//miliseconds
            //Username:
            Transaction_date:$right_form.find('#transaction-date').val(),
            Transaction_time:$right_form.find('#transaction-time').val().toUpperCase(),
            Total:$right_form.find('#total-input').val(),
            Username:JSON.parse(username)[0],
            Receipt_id:imgs[0][0],
            Comment:$("#txtComment").val()
        },function(data){

            if(data=='OK'){
                window.onbeforeunload = null;
                window.location.href=window.location.href;

            }
        }).fail(function() {
            //alert( "error" );
        })  .always(function() {
            //window.location.href=window.location.href;
        });
    });
    $('#btn-discard').click(function(){
        $('#discard-form').show(600);
    });
    $('#discard-remark').change(function(){
        var confirm_discard=confirm("Discard this doc because: "+$(this).val()+" !!!");
        if(confirm_discard){
            var rs={
                docid:parseInt(doc_info.Id[0]),
                description:$(this).val()
            }
            $.post('key/discard/',rs,function(data){

                if(data=='OK'){
                    window.onbeforeunload = null;
                    window.location.href=window.location.href;
                }
            }).fail(function() {
                alert( "error" );
            })  .always(function() {
                //window.location.href=window.location.href;
            });
        }
    });
    $('#right-panel form').validetta({
        onValid : function( event ) {
            event.preventDefault();
            var qty=$right_form.find('#qty').val();
            var price;
            if($('#item-type').val()==='Void' ||$('#item-type').val()==='Coupon'){
                price=-Math.abs(parseFloat($right_form.find('#price').val()));
            }else
                price=Math.abs(parseFloat($right_form.find('#price').val()));
            var per_item=price/qty;
            var $client_detail=$right_form.find('#item-client_detail');

            // validate
            if(isNaN(price) || isNaN(per_item))
                return;
            record=copy_record_from_main();
            /*var record={
             Docid:doc_info.Id,
             Transaction_Type:doc_info.Doctype,
             Total:doc_info.Total,
             Transaction_Date:doc_info.Transaction_date,
             Sr_No:1,
             // Type:$('#right-panel form #item-type').val(),
             Description:$right_form.find('#Description').val(),
             Qty:qty,
             Price:price,
             Per_Item:per_item,
             Item_type:$right_form.find('#item-type').val(),
             Role_author:'Keyer',
             Client_item_detail:$client_detail.val(),
             Transaction_time:$right_form.find('#transaction-time')
             };*/
            var ui_record=create_ui_record(record);
            $('#save-record-main-content>div:last').append(ui_record);
            calculate_all();
            $client_detail.focus();
            $client_detail.val('');
            $right_form.find('#price').val('');
            $right_form.find('#qty').val(1);
            $right_form.find('#item-type').val('Item');

            add_rec_notify_eff();
        },
        onError : function( event ){
            //alert('bb');
        }
    });
    function calculate_all(){
        calculate_sr_no();
        calculate_num_of_records();
        calculate_sub_total();
        calculate_sum_of_qty();
        calculate_tax();
    }
    function create_ui_record(d){
        var div=$('<div class="rec">');
        var tmp=$('<input id="Docid" style="display: none">').val(d.Docid);
        div.append(tmp);
        tmp=$('<input id="Transaction_Type" style="display: none">').val(d.Transaction_Type);
        div.append(tmp);
        tmp=$('<input id="Total" style="display: none">').val(d.Total);
        div.append(tmp);
        tmp=$('<input id="Transaction_Date" style="display: none">').val(d.Transaction_Date);
        div.append(tmp);
        tmp=$('<input id="Sr_No" disabled>').val(d.Sr_No);
        div.append(tmp);

        var item_type=$('<select id="Item_type"></select>')
        var option=$('<option>').val('Item').html('Item');
        item_type.append(option);
        option=$('<option>').val('Void').html('Void');
        item_type.append(option);
        option=$('<option>').val('Coupon').html('Coupon');
        item_type.append(option);
        item_type.val(d.Item_type);
        item_type.change(function(){

            var price;
            if($(this).val()==='Void' || $(this).val()==='Coupon'){
                price=-Math.abs(parseFloat(div.find('#Price').val()));
            }else
                price=Math.abs(parseFloat(div.find('#Price').val()));
            div.find('#Price').val(price);
            per_item.val(price_input.val()/qty.val());
            calculate_all();
        });
        div.append(item_type);

        if(d.Transaction_Type=='UPC_RSD'){
            tmp=$('<input id="Client_item_detail" class="can-ocr" append="append" style="text-transform:uppercase;width:120px" maxlength="14">').val(d.Client_item_detail);
        }else{
            tmp=$('<input id="Client_item_detail" class="can-ocr" append="append" style="text-transform:uppercase" >').val(d.Client_item_detail);
        }

        div.append(tmp);
        if($transaction_type.val()=="RIN_RSD" || $transaction_type.val()=="UPC_RSD"){
            var description=$('<input id="Description" class="can-ocr" append="append" style="text-transform:uppercase;width:200px">').val(d.Description);
            div.append(description);
        }



        var qty=$('<input id="Qty">').val(d.Qty);

        div.append(qty);
        var price_input=$('<input id="Price">').val(d.Price);
        var orginal_color=price_input.css('background');
        price_input.keyup(function(){
            if($(this).val().indexOf('.')===$(this).val().length-1) return;
            if(isNaN($(this).val()))
                $(this).css('background','red');
            else
                $(this).css('background',orginal_color);
            var price;
            if(item_type.val()==='Void' || item_type.val()==='Coupon'){
                price=-Math.abs(parseFloat($(this).val()));
            }else
                price=Math.abs(parseFloat($(this).val()));
            //$(this).val(price);
            per_item.val(price_input.val()/qty.val());
            calculate_all();
        });
        div.append(price_input);
        var per_item=$('<input id="Per_Item" disabled>').val(d.Per_Item);
        div.append(per_item);

        tmp=$('<input id="Role_author" style="display: none">').val(d.Role_author);
        div.append(tmp);
        tmp=$('<input id="Transaction_Time" style="display: none">').val(d.Transaction_Time);
        div.append(tmp);
        var btn_add=$('<div type="button" class="btn-add cmd" alt="Add">').html('A');
        div.append(btn_add);
        var btn_del=$('<div type="button" class="btn-del cmd" alt="Delete">').html('D');
        div.append(btn_del);

        var btn=$('<div type="button" class="btn-copy cmd" alt="Copy">').html('C');
        div.append(btn);
        btn=$('<div type="button" class="btn-paste cmd" alt="Paste">').html('P');
        div.append(btn);
        $(qty,price_input).keyup(function(){
            per_item.val(price_input.val()/qty.val());
        });
        var save_point=$('<input class="save_point" style="display: none">').val(current_x_point);
        div.append(save_point);
        //current_x_point=0;
        var current_image_index=$('<input class="current_image_index" style="display: none">').val($('.img-button-focus').html());
        div.append(current_image_index);
        return div;
        // add overflow effects
        //var element =$('#save-record-main-content');
        //element.show();
        //element.removeClass('content-overflow');
        //if (element.height() < element[0].scrollHeight) {
        //    // your element have overflow
        //    //alert('ok');
        //    element.addClass('content-overflow');
        //}
        //element.hide();

    }
    function copy_from_list(rec){
        return {
            Id:0,
            Docid:doc_info.Id,
            Transaction_Type:rec.find('#Transaction_Type').val(),
            Transaction_Date:rec.find('#Transaction_Date').val(),
            Description:rec.find('#Description').val(),
            Type:rec.find('#Item_type').val(),
            Qty:rec.find('#Qty').val(),
            Price:rec.find('#Price').val(),
            Per_Item:rec.find('#Per_Item').val(),
            Role_author:username,
            Item_type:rec.find('#Item_type').val(),
            Client_item_detail:rec.find('#Client_item_detail').val()
        };
    }
    $('#save-record-main-content').on('click','.btn-copy',function(){
        var rec=$(this).parent();
        copied_record=copy_from_list(rec);
        /*copied_record={
         Id:0,
         Docid:doc_info.Id,
         Transaction_Type:rec.find('#Transaction_Type').val(),
         Transaction_Date:rec.find('#Transaction_Date').val(),
         Type:rec.find('#Item_type').val(),
         Qty:rec.find('#Qty').val(),
         Price:rec.find('#Price').val(),
         Per_Item:rec.find('#Per_Item').val(),
         Role_author:username,
         Item_type:rec.find('#Item_type').val(),
         Client_item_detail:rec.find('#Client_item_detail').val()
         };*/
        return false;
    });
    $('#save-record-main-content').on('click','.btn-paste',function(){
        var ui_record=create_ui_record(copied_record);
        ui_record.insertAfter($(this).parent());
        calculate_all();
        add_rec_notify_eff();
        return false;
    });
    $('#save-record-main-content').on('click','.btn-del',function(){
        var parent=$(this).parent().remove();
        calculate_all();
    });
    $('#save-record-main-content').on('click','.btn-add',function(){
        var rec=$(this).parent();
        var record={
            Id:0,
            Docid:doc_info.Id,
            Transaction_Type:rec.find('#Transaction_Type').val(),
            Transaction_Date:rec.find('#Transaction_Date').val(),
            Type:'Item',
            Qty:1,
            Price:'',
            Per_Item:0,
            Role_author:username,
            Item_type:'Item',
            Client_item_detail:''
        };
        if($transaction_type.val()=="UPC_RSD" ||$transaction_type.val()=="RIN_RSD"){
            record.Description='';
        }
        // no jump on add behavior
        current_x_point=0;
        var ui_record=create_ui_record(record);
        ui_record.insertAfter($(this).parent());
        calculate_all();
        add_rec_notify_eff();
        //var div=$('<div class="rec">');
        //var tmp=$('<input id="Docid" style="display: none">').val(d.Docid);
        //div.append(tmp);
        //tmp=$('<input id="Transaction_Type" style="display: none">').val(d.Transaction_Type);
        //div.append(tmp);
        //tmp=$('<input id="Total" style="display: none">').val(d.Total);
        //div.append(tmp);
        //tmp=$('<input id="Transaction_Date" style="display: none">').val(d.Transaction_Date);
        //div.append(tmp);
        //tmp=$('<input id="Sr_No" disabled>').val(d.Sr_No);
        //div.append(tmp);
        //
        //var item_type=$('<select id="Item_type"></select>')
        //var option=$('<option>').val('Item').html('Item');
        //item_type.append(option);
        //option=$('<option>').val('Void').html('Void');
        //item_type.append(option);
        //option=$('<option>').val('Coupon').html('Coupon');
        //item_type.append(option);
        //item_type.val(d.Item_type);
        //item_type.change(function(){
        //
        //    var price;
        //    if($(this).val()==='Void' || $(this).val()==='Coupon'){
        //        price=-Math.abs(parseFloat(div.find('#Price').val()));
        //    }else
        //        price=Math.abs(parseFloat(div.find('#Price').val()));
        //    div.find('#Price').val(price);
        //    per_item.val(price_input.val()/qty.val());
        //    calculate_all();
        //});
        //div.append(item_type);
        //
        //tmp=$('<input id="Client_item_detail" class="can-ocr" append="append">').val(d.Client_item_detail);
        //div.append(tmp);
        //
        //var qty=$('<input id="Qty">').val(d.Qty);
        //
        //div.append(qty);
        //var price_input=$('<input id="Price">').val(d.Price);
        //var orginal_color=price_input.css('background');
        //price_input.keyup(function(){
        //    if($(this).val().indexOf('.')===$(this).val().length-1) return;
        //    if(isNaN($(this).val()))
        //        $(this).css('background','red');
        //    else
        //        $(this).css('background',orginal_color);
        //    var price;
        //    if(item_type.val()==='Void' || item_type.val()==='Coupon'){
        //        price=-Math.abs(parseFloat($(this).val()));
        //    }else
        //        price=Math.abs(parseFloat($(this).val()));
        //    $(this).val(price);
        //    per_item.val(price_input.val()/qty.val());
        //    calculate_all();
        //});
        //div.append(price_input);
        //var per_item=$('<input id="Per_Item" disabled>').val(d.Per_Item);
        //div.append(per_item);
        //
        //tmp=$('<input id="Role_author" style="display: none">').val(d.Role_author);
        //div.append(tmp);
        //tmp=$('<input id="Transaction_Time" style="display: none">').val(d.Transaction_Time);
        //div.append(tmp);
        //var btn_add=$('<input type="button" value="Add" class="btn-add">');
        //div.append(btn_add);
        //var btn_del=$('<input type="button" value="Del" class="btn-del">');
        //div.append(btn_del);
        //$(qty,price_input).keyup(function(){
        //    per_item.val(price_input.val()/qty.val());
        //});
        //var parent=$('#save-record-main-content .rec');
        //div.insertAfter($(this).parent());
    });
    $('#save-record-main-content').bind('heightChange', function(){
        var element =$(this);
        element.show();
        element.removeClass('content-overflow');
        if (element.height() < element[0].scrollHeight) {
            // your element have overflow
            //alert('ok');
            element.addClass('content-overflow');
        }
        element.hide();
    });
    function delay_change_value(obj,text){
        obj.val(text);
    }
    function calculate_sr_no(){
        var recs=$('#save-record-main-content>div:last>.rec');
        recs.each(function(i,item){
            $(item).find('#Sr_No').val(i+1);
        });
    }
    function calculate_sub_total(){
        var recs=$('#save-record-main-content>div:last>.rec');
        var rs=0.0;
        recs.each(function(i,item){
            rs+=parseFloat($(item).find('#Price').val());
        });
        $('#sub-total').html(parseFloat(rs.toFixed(5))).css('background','#8AE177');
        //var color=$('#sub-total').css('background');
        //if(rs!=doc_info.Total){
        //    $('#sub-total').css('background','red');
        //}else{
        //    $('#sub-total').css('background',color);
        //}
    }
    function calculate_tax(){
        $('#tax-infol').html((parseFloat($('#total-info').html())-parseFloat($('#sub-total').html())).toFixed(5));
    }
    function calculate_sum_of_qty(){
        var rs=0;
        var elms=$('#save-record-main-content>div:last>.rec>#Qty');
        var elms_type=$('#save-record-main-content>div:last>.rec>#Item_type');
        for(var i=0;i<elms.length;i++){
            if($(elms_type[i]).val()=='Item')
                rs+=parseInt(elms[i].value);
            else if($(elms_type[i]).val()=='Void'){
                rs+=-parseInt(elms[i].value);
            }
        }
        $('#sum-of-qty').html(rs);
    }
    function calculate_num_of_records(){
        $('#num-of-record').html($('#save-record-main-content>div:last>.rec').length);
    }

    function add_rec_notify_eff(){

        $notify_zone.stop().animate({backgroundColor: "#67F210"}, 300, function() {//rgba(0,0,0,1)
            $(this).stop().animate({backgroundColor: backcolor}, 300, function(){});
        });
    }
    $('#save-record-main-content').on('focus','.rec input',function(){
        $('#save-record-main-content .rec').css('background','none');
        $(this).parent().css('background','#EDE034');

        if(!is_checked_btn_trace_click){
            return;
        }
        //save point
        var prev_x_point_of_prev_record=parseInt($(this).parent().prev().find('.save_point').val());
        var x_point=parseInt($(this).parent().find('.save_point').val());
        //alert(x_point);
        if(x_point==0) return;
        // go to image_page_index
        var page_index=$(this).parent().find('.current_image_index:first').val();
        if(page_index!=$('.img-button-focus').html()){
            $('.img-button:contains('+page_index+'):first').click();

        }

        setTimeout(function(){
            ctx.restore();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var img=document.getElementById("img");
            if(canvas.width!=img.width){
                canvas.width=img.width;
                canvas.height=img.height;
            }

            ctx.drawImage(img,0,0);
            //ctx.stroke();
            if(prev_x_point_of_prev_record==x_point)
                ctx.strokeStyle="rgba(230, 232, 237, 1)";
            else
                ctx.strokeStyle="rgba(206, 247, 4, 1)";
            ctx.beginPath();
            ctx.moveTo(0,x_point);
            ctx.lineTo(canvas.width,x_point);
            ctx.stroke();
        },20);


    });
    $('#save-record-main-content').on('keypress','.rec input',function(e){
        // keydown
        if (e.keyCode == 40) {
            $(this).parent().next().find('#Client_item_detail').focus();
        }
        // keyup
        else if(e.keyCode == 38){
            $(this).parent().prev().find('#Client_item_detail').focus();
        }
    });
    function create_image_buttons(){
        //$('#img-buttons').html('').append($('<div id="time-counter">'));
        // add download button
        //var i=parseInt($('#img-buttons .img-button-focus').html())-1;
        //var link=$('<a href="'+'../images/'+doc_info.Doc_path+'/'+imgs[i]+'">DL</a>');
        var button=$('<div class="DL">').html("DL");
        $('#addition-info').append(button);
        $('#addition-info .DL').click(function(e){
            var i=parseInt($('#img-buttons .img-button-focus').html())-1;
            //
            //window.location.href='../images/'+doc_info.Doc_path+'/'+imgs[i];
            var win = window.open('../images/'+doc_info.Doc_path+'/'+imgs[i], '_blank');
            win.focus();

        });


        $(imgs).each(function(i,item){
            var button=$('<div class="img-button">').html(i+1);
            $('#img-buttons').append(button);
        });
        $('#img-buttons .img-button:first').addClass('img-button-focus');
        $('#img-buttons .img-button').click(function(){
            $('#img-buttons .img-button-focus').removeClass('img-button-focus');
            var i=parseInt($(this).html())-1;
            $('#img').attr('src','../images/'+doc_info.Doc_path+'/'+imgs[i]).load(function(){
                var img=document.getElementById("img");
                canvas.width=img.width;
                canvas.height=img.height;
                ctx.drawImage(img,0,0);

            });
            $(this).addClass('img-button-focus');
            // reload ocr data
            $.get('../remote/'+doc_info.Doc_path+'/'+imgs[i]+'/xml',function(data,err){
                ocr_data=data.CoordinateList;
                collect_data();
            });

        });
    }
    $right_form.find('#keyer-edit-zone').on('focus','#item-client_detail',function(){
        if($transaction_type.val()=='UPC'){
            if(autocomplete_source[autocomplete_upc_index]==$(this).val())
                focus_ocr_by_index();
        }
    });
    function focus_ocr_by_index(){
        var elm=autocomplete_source_elements[autocomplete_upc_index];
        if(elm) {
            ctx.restore();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var img=document.getElementById("img");
            if(canvas.width!=img.width){
                canvas.width=img.width;
                canvas.height=img.height;
            }

            ctx.drawImage(img,0,0);
            ctx.stroke();
            ocr_focused = elm.content.toString().toUpperCase().replace(/[_$\\()]/g, '');
            $(canvas).css('cursor', 'pointer');
            $entity.html(elm.content);
            ctx.strokeStyle = "rgba(51, 51, 153, 1)";
            ctx.strokeRect(elm.left / percent, elm.top / percent, elm.width / percent, elm.height / percent);
            ctx.font = "30px Arial";
            //alert($(document).scrollLeft());

            gradient = ctx.createLinearGradient(elm.left / percent, elm.top / percent - 50, ctx.measureText(elm.content).width / percent + 10, elm.height / percent + 10);
            gradient.addColorStop("0.7", "cyan");
            ctx.fillStyle = "rgba(51, 51, 153, 0.7)";
            ctx.fillRect(elm.left/percent, elm.top/percent-50, ctx.measureText(elm.content).width*percent+16, elm.height*percent+24);

            var ConfidenceRateList=elm.confidenceRateList;
            var ConfidenceRateList_arr=ConfidenceRateList.split('-');
            ConfidenceRateList_arr=ConfidenceRateList_arr.slice(1,ConfidenceRateList_arr.length);
            var start=elm.left;
            for(var i=0;i<elm.content.length;i++){
                ctx.fillStyle="white";
                if(ConfidenceRateList_arr[i]!='100')
                    ctx.fillStyle="red";
                ctx.fillText(elm.content[i],(start)/percent+5, elm.top/percent-22);
                start+=ctx.measureText(elm.content[i]).width*percent;

            }
            ctx.stroke();
        }
    }
    function collect_data(){
        // set autocomplete
        if($transaction_type.val()==='UPC'){
            collect_data_upc();
            $right_form.find('#item-client_detail').autocomplete({
                source: autocomplete_source,
                minLength: 2,
                select: function( event, ui ) {

                },
                focus:function(event,ui){

                    if($transaction_type.val()=='UPC'){
                        autocomplete_upc_index=$.inArray(ui.item.value, autocomplete_source);
                        focus_ocr_by_index();

                    }
                }
                //select: function( event, ui ) {
                //    $('#keyer-edit-zone input').eq($('#keyer-edit-zone input').index($('#keyer-edit-zone input:focus'))+1).focus();
                //}
            }).data('ui-autocomplete')._renderItem = function( ul, item ) {
                var elm;
                for(var i=0;i<autocomplete_source.length;i++){
                    if(autocomplete_source[i]===item.label){
                        elm=autocomplete_source_elements[i];
                        elm.content=autocomplete_source[i];
                        break;
                    }
                }
                //var elm=findElements_str(item.label);
                if(elm){
                    var ConfidenceRateList=elm.confidenceRateList;
                    var ConfidenceRateList_arr=ConfidenceRateList.split('-');
                    ConfidenceRateList_arr=ConfidenceRateList_arr.slice(1,ConfidenceRateList_arr.length);
                    var main_tag=$('<a>');
                    for(var i=0;i<ConfidenceRateList_arr.length;i++){
                        var char_tag=$('<span>').html(elm.content[i]);
                        if(ConfidenceRateList_arr[i]!='100')
                            char_tag.css('color','red');
                        main_tag.append(char_tag);
                    }
                    return $( "<li></li>" )
                        .data( "ui-autocomplete-item", item )
                        .append(main_tag )
                        .appendTo( ul );
                }else
                    return $( "<li></li>" )
                        .data( "ui-autocomplete-item", item )
                        .append( '<a>' + item.label + '</a>' )
                        .appendTo( ul );
            };
        }else if($transaction_type.val()==='RSD'){
            collect_data_rsd();
            $right_form.find('#item-client_detail').autocomplete({
                source: autocomplete_source,
                minLength: 2
                //appendTo: $("#transaction-time")
                //select: function( event, ui ) {
                //    $('#keyer-edit-zone input').eq($('#keyer-edit-zone input').index($('#keyer-edit-zone input:focus'))+1).focus();
                //}
            });
        }else if($transaction_type.val()==='RIN'){
            //collect_data_upc();
            //$('#right-panel form #item-client_detail').autocomplete({
            //    source: autocomplete_source,
            //    //select: function( event, ui ) {
            //    //    $('#keyer-edit-zone input').eq($('#keyer-edit-zone input').index($('#keyer-edit-zone input:focus'))+1).focus();
            //    //}
            //});
        }
        $.ui.autocomplete.filter = function (array, term) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
            return $.grep(array, function (value) {
                return matcher.test(value.label || value.value || value);
            });
        };
    }
    String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
    }
    function collect_data_upc(){
        if(!ocr_data)
            return;
        if(!ocr_data.Page)
            return;
        autocomplete_source=[];
        autocomplete_source_elements=[];
        var char_should_replace=[
            ['c',0],
            ['o',0],
            ['!',1],
            ['i',1],
            ['l',1],
            ['z',2],
            ['/',7]
        ];
        for(var ipage=0;ipage<ocr_data.Page.length;ipage++){
            for(var iline=0;iline<ocr_data.Page[ipage].Line.length;iline++){
                if(ocr_data.Page[ipage].Line[iline].Entity){
                    for(var ientity=0;ientity<ocr_data.Page[ipage].Line[iline].Entity.length;ientity++){
                        var text=ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0].toLowerCase();
                        if(text=='oc302109'){
                            var gg=1;
                        }
                        var verify_number=true;
                        for(var ichar=0;ichar<text.length;ichar++){
                            var suggest_replaced=false;
                            var char_at=text.charAt(ichar);
                            if(isNaN(char_at)) {
                                for(var i=0;i<char_should_replace.length;i++){
                                    if(char_at.toLowerCase()===char_should_replace[i][0]){
                                        //text = text.replaceAt(ichar, char_should_replace[i][1]);
                                        text=text.replace(char_should_replace[i][0],char_should_replace[i][1]);
                                        suggest_replaced=true;
                                    }
                                }
                                if(!suggest_replaced){
                                    // start with number
                                    verify_number=false;
                                    break;
                                }

                            }
                        }
                        if(verify_number){
                            var coordinateA_arr=ocr_data.Page[ipage].Line[iline].Entity[ientity].Coordinate[0].split('-');

                            var width=parseInt(coordinateA_arr[2]);
                            var height=parseInt(coordinateA_arr[3]);
                            var left=parseInt(coordinateA_arr[0]);
                            var top=parseInt(coordinateA_arr[1]);
                            autocomplete_source_elements.push({
                                left:left,
                                top:top,
                                width:width,
                                height:height,
                                content:ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0],
                                confidenceRateList:ocr_data.Page[ipage].Line[iline].Entity[ientity].ConfidenceRateList[0]
                            });
                            autocomplete_source.push(text);
                        }

                    }
                }


            }
        }
        var uniqueNames = [];
        var uniqueNames_elm = [];
        $.each(autocomplete_source, function(i, el){
            if($.inArray(el, uniqueNames) === -1){

                uniqueNames.push(el);
                uniqueNames_elm.push(autocomplete_source_elements[i]);
            }
        });
        autocomplete_source=uniqueNames;
        autocomplete_source_elements=uniqueNames_elm;
    }
    var autocomplete_array_char_filter=['\'',':','*','•','_','?','>','<'];
    function collect_data_rsd(){
        if(!ocr_data)
            return;
        if(!ocr_data.Page)
            return;
        autocomplete_source=[];
        for(var ipage=0;ipage<ocr_data.Page.length;ipage++){
            for(var iline=0;iline<ocr_data.Page[ipage].Line.length;iline++){
                if(ocr_data.Page[ipage].Line[iline].Entity){
                    var con_text='';
                    for(var ientity=0;ientity<ocr_data.Page[ipage].Line[iline].Entity.length;ientity++){
                        var text=ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0];
                        for(var ispecialchar=0;ispecialchar<autocomplete_array_char_filter.length;ispecialchar++){
                            if(text.indexOf(autocomplete_array_char_filter[ispecialchar])>=0){
                                continue;
                            }
                        }
                        if(text.length<2) continue;
                        var coordinateA_arr=ocr_data.Page[ipage].Line[iline].Entity[ientity].Coordinate[0].split('-');
                        var width=parseInt(coordinateA_arr[2]);
                        var height=parseInt(coordinateA_arr[3]);
                        var left=parseInt(coordinateA_arr[0]);
                        var top=parseInt(coordinateA_arr[1]);
                        var virtual_width=1200;
                        var img_width=$('#img').width();
                        //console.log(text+ ' ');
                        if(text=='HERSH'){
                            var a=1;
                        }

                        if(ocr_data.Page[ipage].Line[iline].Entity[ientity+1]){
                            var coordinateA_arr_next=ocr_data.Page[ipage].Line[iline].Entity[ientity+1].Coordinate[0].split('-');
                            var text_next=ocr_data.Page[ipage].Line[iline].Entity[ientity+1].String[0];
                            //var width_prev=parseInt(coordinateA_arr_prev[2]);
                            //var height_prev=parseInt(coordinateA_arr_prev[3]);
                            var left_next=parseInt(coordinateA_arr_next[0]);
                            //var top_prev=parseInt(coordinateA_arr_prev[1]);




                            if(Math.abs(left+width-left_next)<25*(img_width/virtual_width)){
                                con_text+=' '+text;
                            }else{
                                if(text.length<2) continue;
                                autocomplete_source.push(text);
                                if(con_text.length<2) continue;
                                autocomplete_source.push((con_text+' '+text).trim());
                                con_text='';
                            }
                        }else{
                            if(text.length<2) continue;
                            autocomplete_source.push(text);
                            if(con_text.length<2) continue;
                            autocomplete_source.push((con_text+' '+text).trim());
                            con_text='';
                        }

                    }

                }


            }
        }
        var uniqueNames = [];
        $.each(autocomplete_source, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        autocomplete_source=uniqueNames;
    }
    // event keyer
    $('#img-buttons').prepend($('#addition-info').css('display','inline-block'));
    function select_transaction(){
        if(transaction_type=='RSD'){
            $('#keyer-edit-zone').html($('#rsd_template').html())
        }else if(transaction_type=='UPC'){
            $('#keyer-edit-zone').html($('#upc_template').html())
        }else if(transaction_type=='RIN'){
            $('#keyer-edit-zone').html($('#rin_template').html())
        }else if(transaction_type=='RIN_RSD'){
            $('#keyer-edit-zone').html($('#rin_rsd_template').html())
        }else if(transaction_type=='UPC_RSD'){
            $('#keyer-edit-zone').html($('#upc_rsd_template').html())
        }
        var item_type=$right_form.find('#item-type');
        var price_input=$right_form.find('#price');
        var orginal_color=price_input.css('background');
        item_type.change(function(){
            var price;
            if($(this).val()==='Void' || $(this).val()==='Coupon'){
                price=-Math.abs(parseFloat(price_input.val()));
            }else
                price=Math.abs(parseFloat(price_input.val()));
            $right_form.find('#price').val(price);
        });
        price_input.keyup(function(){
            if($(this).val().indexOf('.')===$(this).val().length-1) return;
            if(isNaN($(this).val()))
                $(this).css('background','red');
            else
                $(this).css('background',orginal_color);
            var price;
            if(item_type.val()==='Void' || item_type.val()==='Coupon'){
                price=-Math.abs(parseFloat($(this).val()));
            }else
                price=Math.abs(parseFloat($(this).val()));
            //setTimeout(function(){
            //    delay_change_value($(this),price);
            //},500);
            //price_input.val(price);
            calculate_all();
        });
    }
    $transaction_type.change(function(){
        transaction_type=$(this).val();
        select_transaction();
    });
    $('#form-edit-zone1 #transaction-time').blur(function(){
        var text=$(this).val().toUpperCase();
        if(text.length===4 && text.indexOf(":") < 0){

            $(this).val(text.toHHMM());
        }
        else if(text.length===5 && text.indexOf(":") < 0){
            var am_or_pm=$(this).val().substring(4,5).toLowerCase()==='a'?'AM':'PM';
            $(this).val(text.toHHMM()+' '+am_or_pm);

        }
        else if(text.length===6 && text.indexOf(":") < 0){
            $(this).val(text.toHHMMSS());

        }
        else if(text.length===7 && text.indexOf(":") < 0){
            var am_or_pm=$(this).val().substring(6,7).toLowerCase()==='a'?'AM':'PM';
            $(this).val(text.toHHMMSS()+' '+am_or_pm);

        }
        $(this).val($(this).val().toUpperCase());
    });
    String.prototype.toHHMM = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours   = Math.floor(this.substring(0,2));
        var minutes = Math.floor(this.substring(2,4));
        //var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var orginal_color= $('#form-edit-zone1 #transaction-time').css('background');
        if(isNaN(hours) || isNaN(minutes)){
            $('#form-edit-zone1 #transaction-time').css('background','red');
        }else
            $('#form-edit-zone1 #transaction-time').css('background',orginal_color);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        //if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes;
        return time;
    }
    String.prototype.toHHMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours   = Math.floor(this.substring(0,2));
        var minutes = Math.floor(this.substring(2,4));
        var seconds = Math.floor (this.substring(4,6));

        var orginal_color= $('#form-edit-zone1 #transaction-time').css('background');
        if(isNaN(hours) || isNaN(minutes) || isNaN(seconds)){
            $('#form-edit-zone1 #transaction-time').css('background','red');
        }else
            $('#form-edit-zone1 #transaction-time').css('background',orginal_color);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    }
    // LOAD PAGE EVENT AND INIT THINGS/DATA
    // select doctype when load
    $('#show-addons').featherlight($('#addons-zone'), {resetCss:     false,persist:      true});
    $('#btn-ruler').click(function(e){
        e.preventDefault();
        $(this).toggleClass('btn-on');
        is_show_ruler=$(this).hasClass('btn-on');
    });
    var is_checked_btn_trace_click=$('#btn-trace-click').hasClass('btn-on');
    $('#btn-trace-click').click(function(e){
        e.preventDefault();
        $(this).toggleClass('btn-on');
        is_checked_btn_trace_click=$(this).hasClass('btn-on');
    });
    $('#transaction-time').focus();
    $transaction_type.val(doc_info.Doctype);

    transaction_type=doc_info.Doctype;
    $('#total-info').text(doc_info.Total);
    select_transaction();
    $('#total-input').val(doc_info.Total);
    create_image_buttons();
    var total_input_background=$('#total-input').css('background-color');
    $('#total-input').keyup(function(){
        if($(this).val()!=doc_info.Total)
            $(this).css('background-color','red');
        else
            $(this).css('background-color',total_input_background);
    });
    $('#transaction-date').val(doc_info.Transaction_date);
    //var total_input_background=$('#total-input').css('background-color');
    $('#transaction-date').keyup(function(){
        if($(this).val()!=doc_info.Transaction_date)
            $(this).css('background-color','red');
        else
            $(this).css('background-color',total_input_background);
    });
    //$('#time-counter').countup();
    setTimeout(function(){
        collect_data();
    },1000);
    // hot keys
    $(document).bind('keydown', 'backspace', function assets() {
        return false;
    });
    $('*').bind('keydown', 'esc', function assets() {
        //$('#save-record-main-content').hide('blind',{},200);
        hide_me();
        return false;
    });
    $(document).bind('keydown', function(e) {
        if(e.ctrlKey && (e.which == 83)) {
            e.preventDefault();
            $right_form.find('#btn-add').click();
            return false;
        }
    });
    $('input,select').bind('keydown', 'Ctrl+space', function assets() {
        $right_form.find('#btn-add').click();
        return false;
    });

    $('*').bind('keydown', 'Ctrl+s', function(event) {
        setTimeout(function() {
            $right_form.find('#btn-save').click();
        }, 0);
        return false;
    });
    function copy_record_from_main(){
        var qty=$right_form.find('#qty').val();
        var price;
        if($('#item-type').val()==='Void' ||$('#item-type').val()==='Coupon'){
            price=-Math.abs(parseFloat($right_form.find('#price').val()));
        }else
            price=Math.abs(parseFloat($right_form.find('#price').val()));
        var per_item=price/qty;
        var $client_detail=$right_form.find('#item-client_detail');

        // validate
        if(isNaN(price) || isNaN(per_item))
            return;

        return {
            Docid:doc_info.Id,
            Transaction_Type:doc_info.Doctype,
            Total:doc_info.Total,
            Transaction_Date:doc_info.Transaction_date,
            Sr_No:1,
            // Type:$('#right-panel form #item-type').val(),
            Description:$right_form.find('#description').val(),
            Qty:qty,
            Price:price,
            Per_Item:per_item,
            Item_type:$right_form.find('#item-type').val(),
            Role_author:'Keyer',
            Client_item_detail:$client_detail.val(),
            Transaction_time:$right_form.find('#transaction-time')
        };
    }
    $('*').bind('keydown', 'Ctrl+k', function assets() {
        var qty=$right_form.find('#qty').val();
        var price;
        if($('#item-type').val()==='Void' ||$('#item-type').val()==='Coupon'){
            price=-Math.abs(parseFloat($right_form.find('#price').val()));
        }else
            price=Math.abs(parseFloat($right_form.find('#price').val()));
        var per_item=price/qty;
        var $client_detail=$right_form.find('#item-client_detail');

        copied_record=copy_record_from_main();
        /*var qty=$right_form.find('#qty').val();
         var price;
         if($('#item-type').val()==='Void' ||$('#item-type').val()==='Coupon'){
         price=-Math.abs(parseFloat($right_form.find('#price').val()));
         }else
         price=Math.abs(parseFloat($right_form.find('#price').val()));
         var per_item=price/qty;
         var $client_detail=$right_form.find('#item-client_detail');

         // validate
         if(isNaN(price) || isNaN(per_item))
         return;

         copied_record={
         Docid:doc_info.Id,
         Transaction_Type:doc_info.Doctype,
         Total:doc_info.Total,
         Transaction_Date:doc_info.Transaction_date,
         Sr_No:1,
         // Type:$('#right-panel form #item-type').val(),
         Qty:qty,
         Price:price,
         Per_Item:per_item,
         Item_type:$right_form.find('#item-type').val(),
         Role_author:'Keyer',
         Client_item_detail:$client_detail.val(),
         Transaction_time:$right_form.find('#transaction-time')
         };*/
        $('#btn-add').click();

        $client_detail.focus();
        $client_detail.val('');
        $right_form.find('#price').val('');
        $right_form.find('#description').val('');
        $right_form.find('#qty').val(1);
        $right_form.find('#item-type').val('Item');
        calculate_all();

        return false;
    });
    $('*').bind('keydown', 'Ctrl+p', function assets() {
        var ui_record=create_ui_record(copied_record);
        $('#save-record-main-content>div:last').append(ui_record);
        calculate_all();
        $right_form.find('#price').val('');
        $right_form.find('#qty').val(1);
        $right_form.find('#item-type').val('Item');
        add_rec_notify_eff();
        return false;
    });
    $(document).bind('keydown', 'Ctrl+g', function assets() {
        degrees+=90;
        if(degrees>270) degrees=0;
        if(degrees==90 || degrees==270){
            canvas.width=img.height;
            canvas.height=img.width;
        }else{
            canvas.width=img.width;
            canvas.height=img.height;
        }
        drawRotated(degrees);
        return false;
    });
    $('*').bind('keydown', 'Ctrl+l', function assets() {
        if($('#save-record-main-content').is(':visible')){
            //$('#save-record-main-content').hide('blind',{},200);
            hide_me();
        }else{
            //$('#save-record-main-content').show('blind',{},400);
            show_me();
        }
        return false;
    });


    $('*').bind('keydown', 'f1', function assets() {
        $('#img-buttons .img-button.img-button-focus').prev().click();
        return false;
    });

    $('*').bind('keydown', 'f2', function assets() {
        $('#img-buttons .img-button.img-button-focus').next().click();
        return false;
    });
    $('*').bind('keydown', 'f9', function assets() {
        //var new_width=$(canvas).width()-($('#img').width()*.04);
        percent=percent-0.05;//new_width/$('#img').width();
        zoom();
        return false;
    });
    $('*').bind('keydown', 'f10', function assets() {
        //var new_width=$(canvas).width()+($('#img').width()*.04);
        //percent=new_width/$('#img').width();
        percent=percent+0.05;
        zoom();
        return false;
    });
    function zoom(){

        var new_width=$('#img').width()*percent;
        var new_height=$('#img').height()*percent;

        $(canvas).width(new_width);
        $(canvas).height(new_height);
        //$('p').html(percent);
    }

    $(document).mousedown(function(e) {
        switch (e.which) {
            case 1:
                //alert('Left Mouse button pressed.');
                if(!$(e.target).is("#save-record-zone *") && !$(e.target).is("#btn-add") && !$(e.target).is("#right-panel input"))
                //$('#save-record-main-content').hide('blind',{},200);// || $(e.target).closest("#save-record-main-content").length
                    hide_me();
                break;
            case 2:
                //alert('Middle Mouse button pressed.');
                break;
            case 3:
                //alert('Right Mouse button pressed.');
                break;
            default:
            //alert('You have a strange Mouse!');
        }
    });

    $('#save-record-title').click(function(e){
        if($('#save-record-main-content').is(':visible')){
            hide_me();
        }else{
            show_me();
        }

    });
    function hide_me(){
        $('#save-record-main-content').css('display','none');
        $('#save-record-main-content').css('visibility','hidden');//hide('blind',{},200);
        $('#save-record-zone').css('background','none');
    }
    function show_me(){
        $('#save-record-main-content').css('display','block');
        $('#save-record-main-content').css('visibility','visible');//.show('blind',{},400);
        $('#save-record-zone').css('background','rgba(11, 144, 226, 0.8) none repeat scroll 0 0');
    }
    canvas.addEventListener('mousemove', mouseMove, false);

    //canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    var ocr_focused;
    function findElements_str(str){
        if(!ocr_data)
            return;
        if(!ocr_data.Page)
            return;
        for(var ipage=0;ipage<ocr_data.Page.length;ipage++){
            for(var iline=0;iline<ocr_data.Page[ipage].Line.length;iline++){
                if(ocr_data.Page[ipage].Line[iline].Entity){
                    for(var ientity=0;ientity<ocr_data.Page[ipage].Line[iline].Entity.length;ientity++){
                        if(str.toLowerCase()==ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0]){
                            var coordinateA_arr=ocr_data.Page[ipage].Line[iline].Entity[ientity].Coordinate[0].split('-');

                            var width=parseInt(coordinateA_arr[2]);
                            var height=parseInt(coordinateA_arr[3]);
                            var left=parseInt(coordinateA_arr[0]);
                            var top=parseInt(coordinateA_arr[1]);
                            return {
                                left:left,
                                top:top,
                                width:width,
                                height:height,
                                content:ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0],
                                confidenceRateList:ocr_data.Page[ipage].Line[iline].Entity[ientity].ConfidenceRateList[0]
                            };
                        }


                    }
                }


            }
        }
    }
    function findElements(x,y){
        if(!ocr_data)
            return;
        if(!ocr_data.Page)
            return;
        for(var ipage=0;ipage<ocr_data.Page.length;ipage++){
            for(var iline=0;iline<ocr_data.Page[ipage].Line.length;iline++){
                if(ocr_data.Page[ipage].Line[iline].Entity){
                    for(var ientity=0;ientity<ocr_data.Page[ipage].Line[iline].Entity.length;ientity++){
                        var coordinateA_arr=ocr_data.Page[ipage].Line[iline].Entity[ientity].Coordinate[0].split('-');

                        var width=parseInt(coordinateA_arr[2])*percent;
                        var height=parseInt(coordinateA_arr[3])*percent;
                        var left=parseInt(coordinateA_arr[0])*percent;
                        var top=parseInt(coordinateA_arr[1])*percent;
                        if (left-2 < x*percent && (left+ width)+2 > x*percent &&
                            top-2 < y*percent && (top + height)+2 > y*percent)
                            return {
                                left:left,
                                top:top,
                                width:width,
                                height:height,
                                content:ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0],
                                confidenceRateList:ocr_data.Page[ipage].Line[iline].Entity[ientity].ConfidenceRateList[0]
                            };

                    }
                }


            }
        }
    }
    function findElements_inline(x,y){
        if(!ocr_data)
            return;
        if(!ocr_data.Page)
            return;
        for(var ipage=0;ipage<ocr_data.Page.length;ipage++){
            for(var iline=0;iline<ocr_data.Page[ipage].Line.length;iline++){
                if(ocr_data.Page[ipage].Line[iline].Entity){
                    for(var ientity=0;ientity<ocr_data.Page[ipage].Line[iline].Entity.length;ientity++){
                        var coordinateA_arr=ocr_data.Page[ipage].Line[iline].Entity[ientity].Coordinate[0].split('-');

                        var width=parseInt(coordinateA_arr[2])*percent;
                        var height=parseInt(coordinateA_arr[3])*percent;
                        var left=parseInt(coordinateA_arr[0])*percent;
                        var top=parseInt(coordinateA_arr[1])*percent;
                        if (left-2 < x*percent && (left+ width)+2 > x*percent &&
                            top-2 < y*percent && (top + height)+2 > y*percent)
                            return {
                                left:left,
                                top:top,
                                width:width,
                                height:height,
                                content:ocr_data.Page[ipage].Line[iline].Entity[ientity].String[0],
                                confidenceRateList:ocr_data.Page[ipage].Line[iline].Entity[ientity].ConfidenceRateList[0]
                            };

                    }
                }


            }
        }
    }
    function mouseUp(e){

        if(ocr_focused){
            var control=$('#right-panel .can-ocr:focus,.rec .can-ocr:focus');
            if(control.html()===''){
                if(control.attr('append')){
                    if(control.val().trim()=='')
                        control.val(ocr_focused);
                    else
                        control.val(control.val().trim()+' '+ocr_focused);
                    control.scrollLeft(5000000);
                }else{
                    control.val(ocr_focused);
                    if($(control).attr('id')==='price') {
                        var orginal_color = control.css('background');
                        if (isNaN($(control).val())){
                            $(control).css('background', 'red');
                            return;
                        }
                        else{
                            $(control).css('background', orginal_color);
                        }

                    }
                    $('#keyer-edit-zone input').eq($('#keyer-edit-zone input').index(control)+1).focus();
                    //control.next('input').focus();
                }

                if($(control).attr('id')==='price'){



                    var item_type=$('#keyer-edit-zone #item-type')
                    var qty=$('#keyer-edit-zone #qty');
                    var price_input=$('#keyer-edit-zone #price');

                    var price;
                    if(item_type.val()==='Void' || item_type.val()==='Coupon'){
                        price=-Math.abs(parseFloat(price_input.val()));
                    }else
                        price=Math.abs(parseFloat(price_input.val()));
                    $(price_input).val(price);
                    calculate_all();
                }



            }

        }
        // drawline on image
        if(is_show_ruler){
            ctx.strokeStyle="rgba(51, 51, 153, 1)";
            ctx.restore();
            var img=document.getElementById("img");

            ctx.drawImage(img,0,0);
            ctx.beginPath();
            ctx.moveTo(0,mousePos.top);
            ctx.lineTo(canvas.width,mousePos.top);
            ctx.stroke();
        }
        current_x_point=mousePos.top;

    }
    function mouseMove(e) {
        if(degrees>0) return;
        mousePos = {
            left: e.pageX - $(document).scrollLeft() - $('#'+img_drawing_name).offset().left,
            top: e.pageY - $(document).scrollTop() - $('#'+img_drawing_name).offset().top
        };
        mousePos = {
            left: mousePos.left/percent,
            top: mousePos.top/percent
        };
        $info.html(mousePos.left+":"+mousePos.top);

        // clear path
        //ctx.beginPath();
        ctx.restore();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var img=document.getElementById("img");
        if(canvas.width!=img.width){
            canvas.width=img.width;
            canvas.height=img.height;
        }

        ctx.drawImage(img,0,0);
        ctx.stroke();

        //ctx.strokeStyle="red";
        //ctx.rect(50,50,150,80);
        var elm=findElements(mousePos.left, mousePos.top);
        $(canvas).css( 'cursor', 'grab' );
        if(elm){
            ocr_focused=elm.content.toString().toUpperCase().replace(/[_$\\()]/g,'');
            $(canvas).css( 'cursor', 'pointer' );
            $entity.html(elm.content);
            ctx.strokeStyle="rgba(51, 51, 153, 1)";
            ctx.strokeRect(elm.left/percent, elm.top/percent, elm.width/percent, elm.height/percent);
            ctx.font="30px Arial";
            //alert($(document).scrollLeft());

            gradient=ctx.createLinearGradient(elm.left/percent, elm.top/percent-50, ctx.measureText(elm.content).width/percent+10, elm.height/percent+10);
            gradient.addColorStop("0.7","cyan");
            ctx.fillStyle="rgba(51, 51, 153, 0.7)";
            //ctx.fillRect(elm.left/percent, elm.top/percent-50, ctx.measureText(elm.content).width/percent+12, elm.height/percent+20);
            ctx.fillRect(elm.left/percent, elm.top/percent-50, ctx.measureText(elm.content).width*percent+16, elm.height*percent+24);

            var ConfidenceRateList=elm.confidenceRateList;
            var ConfidenceRateList_arr=ConfidenceRateList.split('-');
            ConfidenceRateList_arr=ConfidenceRateList_arr.slice(1,ConfidenceRateList_arr.length);
            var start=elm.left;
            for(var i=0;i<elm.content.length;i++){
                ctx.fillStyle="white";
                if(ConfidenceRateList_arr[i]!='100')
                    ctx.fillStyle="red";
                ctx.fillText(elm.content[i],(start)/percent+5, elm.top/percent-22);
                start+=ctx.measureText(elm.content[i]).width*percent;

            }
            ctx.stroke();
        }
        else
            ocr_focused=null;

    }
// create load autosave button
    if(can_load_autosave){
        $('body').append($('<div id="btn-load-autosave-data" style="padding: 5px; top: 0px; left: 0px; position: absolute; width: 152px; background: red none repeat scroll 0% 0%; height: 43px; cursor: pointer; color: white; z-index: 999; opacity: 1;">').html('Crashed??? reload your data!!!'))
    }
    // add ranking_info
    if(top_rank){
        var _username=JSON.parse(username)[0];
        for (var i = 0; i < top_rank.length; i++) {
            var index=i+1;
            if(top_rank[i].lockedby==_username){
                if(i==0){
                    $('body').append($('<div style="top: 0px; position: absolute;" alt="'+top_rank[i].count+' recs" title="'+top_rank[i].count+' recs">').addClass('rank_'+index).html('You are the King!'));
                    $('body').css('background','rgba(252,219,128,0.7)');
                }else{
                    var $div=$('<div style="top: 0px; position: absolute;" alt="'+top_rank[i].count+' recs" title="'+top_rank[i].count+' recs">').addClass('rank_'+index).html('Top '+index+': '+top_rank[i].count+' recs');
                    var next_people=top_rank[i-1];
                    var next_level=$('<div>').html('Next rank: '+next_people.count+' recs').append($('<div class="rank_'+(i)+'" style="border: none; display: inline; ">'));
                    $div.append(next_level);
                    $('body').append($div);
                    if(i>0 && i<5){
                        $('body').css('background','rgba(189,249,229,0.7)');
                    }
                }

            }
        }
    }
    $('#btn-load-autosave-data').click(function(){
        if(!confirm('Load your unsaved data??')){
            return;
        }
        $.get('autosave', function (data, err) {
            o = JSON.parse(data);
            for(var i=0;i<o.recs.length;i++){
                var rec=o.recs[i];


                var qty = rec.Qty;;
                var price;
                if (rec.Type === 'Void' || rec.Type === 'Coupon') {
                    price = -Math.abs(parseFloat(rec.Price));
                } else
                    price = Math.abs(parseFloat(rec.Price));
                var per_item = price / qty;

                // validate
                if (isNaN(price) || isNaN(per_item))
                    return;

                var _rec;
                if(o.type=="RSD"){
                    _rec= {
                        Docid: doc_info.Id,
                        Transaction_Type: doc_info.Doctype,
                        Total: doc_info.Total,
                        Transaction_Date: doc_info.Transaction_date,
                        Sr_No: rec.Sr_No,
                        Description: rec.Item_description,///
                        Qty: qty,
                        Price: price,
                        Per_Item: per_item,
                        Item_type: rec.Type,
                        Role_author: 'Keyer',
                        Client_item_detail: rec.Item_description,
                        Transaction_time: rec.Transaction_time
                    };
                }else if(o.type=="UPC"){
                    _rec= {
                        Docid: doc_info.Id,
                        Transaction_Type: doc_info.Doctype,
                        Total: doc_info.Total,
                        Transaction_Date: doc_info.Transaction_date,
                        Sr_No: rec.Sr_No,
                        Description: rec.Upc_code,///
                        Qty: qty,
                        Price: price,
                        Per_Item: per_item,
                        Item_type: rec.Type,
                        Role_author: 'Keyer',
                        Client_item_detail: rec.Upc_code,
                        Transaction_time: rec.Transaction_time
                    };
                }else if(o.type=="RIN"){
                    _rec= {
                        Docid: doc_info.Id,
                        Transaction_Type: doc_info.Doctype,
                        Total: doc_info.Total,
                        Transaction_Date: doc_info.Transaction_date,
                        Sr_No: rec.Sr_No,
                        Description: rec.Item_number,///
                        Qty: qty,
                        Price: price,
                        Per_Item: per_item,
                        Item_type: rec.Type,
                        Role_author: 'Keyer',
                        Client_item_detail: rec.Item_number,
                        Transaction_time: rec.Transaction_time
                    };
                }else if(o.type=="aaa"){
                    _rec= {
                        Docid: doc_info.Id,
                        Transaction_Type: doc_info.Doctype,
                        Total: doc_info.Total,
                        Transaction_Date: doc_info.Transaction_date,
                        Sr_No: rec.Sr_No,
                        Description: rec.Item_number,///
                        Qty: qty,
                        Price: price,
                        Per_Item: per_item,
                        Item_type: rec.Type,
                        Role_author: 'Keyer',
                        Client_item_detail: rec.Item_number,
                        Transaction_time: rec.Transaction_time
                    };
                }
                else if(o.type=="bbb"){
                    _rec= {
                        Docid: doc_info.Id,
                        Transaction_Type: doc_info.Doctype,
                        Total: doc_info.Total,
                        Transaction_Date: doc_info.Transaction_date,
                        Sr_No: rec.Sr_No,
                        Description: rec.Item_number,///
                        Qty: qty,
                        Price: price,
                        Per_Item: per_item,
                        Item_type: rec.Type,
                        Role_author: 'Keyer',
                        Client_item_detail: rec.Item_number,
                        Transaction_time: rec.Transaction_time
                    };
                }

                var ui_record = create_ui_record(_rec);
                $('#save-record-main-content>div:last').append(ui_record);
            }
            calculate_all();
            alert("Load done ^.^");
        })
    });



});