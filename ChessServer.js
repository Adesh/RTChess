/*
 AUTHOR: Adesh Shah
 AdeshShah.com
 First commit: 17/March/2015
 
	-> command to run: node ChessServer.js
	-> server.listen(8080); can be replaced with server.listen(8080, 'ANY_IP_ADDR');

*/

var mysql = require('mysql');
var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  //app.configure(function(){
    app.use(express.static(__dirname + '/Game'));
//});
server.listen(8080);
console.log("Server listening at localhost:8080\n\n");

var h = 'localhost', u='root', pw='', db='chess';
var db_connection = mysql.createConnection({ host:h, user:u, password:pw, database:db });
db_connection.connect();

process.on('uncaughtException', function (err) {
    console.log(err);
});

// open the socket connection
io.sockets.on('connection', function (socket) 
{	
	socket.on('Req_Name_Uniqueness', function (nickname) 
	{
		//db_connection.connect();
		db_connection.query('SELECT `name` FROM `user` WHERE `name`=?', [nickname], function selectCb(error, results, fields) 
		{
			if (error) {console.log('GetData Error5: ' + error.message);return;}
			if(results.length == 0)
			{
				//socket.set('register', nickname, function() 
				//{
					db_connection.query("insert into `user` (`name`, `sid`, `partner`, `inittime`) values (?,?,?,?)", [nickname, socket.id, '',''], function(err, info) {
						if (err) {console.log('GetData Error7: ' + error.message);return;}
					});
					
				//});
				//io.sockets.connected[socket.id].emit
				io.sockets.connected[socket.id].emit('Res_Name_Uniqueness', {res:true, nickname:nickname, host_socket_id:socket.id});
				console.log("Nickname accepted: " + nickname + "\n");
			}
			else
			{
				//socket.emit('Res_NameUniqueness', false);
				io.sockets.connected[socket.id].emit('Res_Name_Uniqueness', {res:false, nickname:nickname, host_socket_id:socket.id});
				console.log("Nickname not accepted.\n");
			}
			//db_connection.end();
			Get_Online_List();
		});
				
	});	


	//send req for partnership (Req_Connection: host to server , Req_Connection_2: server to partner)
	socket.on('Req_Connection', function (data) 
	{
		//db_connection.connect();
		db_connection.query('SELECT * FROM `user` WHERE `name`=?', [data.partner_nickname], function selectCb(error, results, fields) 
		{
			if (error) {console.log('GetData Error5: ' + error.message);return;}
			if(results.length == 1 && results[0].partner == "")
			{
				//io.sockets.connected[socket.id].emit
				console.log(data.host_nickname + " asks " + data.partner_nickname + " for connection.\n");
				io.sockets.connected[results[0].sid].emit('Req_Connection_2', {host_nickname:data.host_nickname, host_socket_id:data.host_socket_id, partner_socket_id:results[0].sid});			
			}
			//db_connection.end();
		});
	});
	
	//on rcving partnership confirmation
	socket.on('Res_Partnership', function (data) 
	{
		if(data.partnership_accepted == true){
			console.log("Partnership accepted: " + data.host_socket_id + " <-> "+ data.partner_socket_id + "\n");
			Connect_User(data.host_socket_id, data.partner_socket_id);
		}		
	});
	
	//end to end Chess Move
	socket.on('Req_Chess_Move',  function (data) 
	{
		////io.sockets.connected[socket.id].emit
		io.sockets.connected[data.partner_socket_id].emit('Res_Chess_Move', data.move);
	});
	
	//ManualDisconnect	
	socket.on('Req_Manual_Disconnect',  function (data) 
	{
		//db_connection.connect();
		db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid` IN (?,?)", ["",data.host_socket_id,data.partner_socket_id], function(err, info) {/*callback(info.insertId);*/});
		io.sockets.connected[data.partner_socket_id].emit('Partner_Disconnected', data.host_socket_id);
		console.log("Disconnect request: "+ data.host_socket_id + " <-> " + data.partner_socket_id);
		//db_connection.end();
		Get_Online_List();
	});
	
	socket.on('disconnect', function()
	{
		Delete_User(socket.id);
	});
});

/* function definitions */
function Get_Online_List()
{

	//db_connection.connect();
	db_connection.query('SELECT * FROM `user` WHERE `partner`=?', [""], function selectCb(error, results, fields) 
	{
		if (error) {console.log('GetData Error1: ' + error.message);return;}
			
		var user_online = new Array();  
		for(var i =0; i<results.length; i++)
		{
			//var row=results[i];
			user_online.push(results[i].name);   
		}
		io.sockets.emit('Res_Online_List', user_online);
		console.log("Online_List_Broadcast: " + results.length + "\n");
		//db_connection.end();
	});
}

//func to delete
function Delete_User(toDlt)
{
	db_connection.query('SELECT `partner` FROM `user` WHERE `sid` = ?', [toDlt], function selectCb(error, results, fields) 
	{
		if (error) {console.log('GetData Error2: ' + error.message);return;}
		if(typeof variable !== 'undefined'){
			if(results[0].partner != "")
			{
				io.sockets.connected[results[0].partner].emit('Partner_Disconnected', "");
				db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", ["",results[0].partner], function(err, info) {/*callback(info.insertId);*/});
			}
		}
		db_connection.query("DELETE FROM `user` WHERE `sid`=?", [toDlt], function(err2, info) {/*callback(info.insertId);*/
			if (err2) {console.log('GetData Error2: ' + error.message);return;}
			else{Get_Online_List();}
		});
		//db_connection.end();
	});
}

//func to add partnershin info
function Connect_User(host_socket_id, partner_socket_id)
{
	//db_connection.connect();
	db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", [host_socket_id, partner_socket_id], function(err, info) {/*callback(info.insertId);*/});
	//if (err) {console.log('GetData Error4: ' + err.message);return;}
	db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", [partner_socket_id, host_socket_id], function(err2, info2) {/*callback(info.insertId);*/});	 
	//if (err2) {console.log('GetData Error4: ' + err2.message);return;}
	
	db_connection.query("SELECT `name`,`sid` FROM `user` WHERE `sid` IN (?,?)", [host_socket_id, partner_socket_id], function selectCb(error, results, fields){
		if (error) {console.log('GetData Error4: ' + error.message);return;}
		
		//var temp_host_is_white_army = [true,false][Math.round(Math.random())];
		
		var temp_partner_nickname, temp_partner_socket_id;
		if(results[0].sid == host_socket_id)
		{
			io.sockets.connected[host_socket_id].emit('Begin_Chess', {partner_nickname:results[1].name, partner_socket_id:results[1].sid, i_am_white_army:true});
			io.sockets.connected[partner_socket_id].emit('Begin_Chess', {partner_nickname:results[0].name, partner_socket_id:results[0].sid, i_am_white_army:false});
		}
		else  /* else if(results[0].sid == partner_socket_id) */
		{
			io.sockets.connected[host_socket_id].emit('Begin_Chess', {partner_nickname:results[0].name, partner_socket_id:results[0].sid, i_am_white_army:true});
			io.sockets.connected[partner_socket_id].emit('Begin_Chess', {partner_nickname:results[1].name, partner_socket_id:results[1].sid, i_am_white_army:false});
		}
		console.log("Game beginning: " + results[0].name + " <-> " + results[1].name + "\n");
		//db_connection.end();
	});				
	Get_Online_List();	
} 
