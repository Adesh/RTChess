/*
 AUTHOR: Adesh Shah
 AdeshShah.com
 (+91) 942 88 999 25
 
 First commit: 17/March/2015
 
	-> command to run: node ChessServer.js
	-> server.listen(8080); can be replaced with server.listen(8080, 'ANY_IP_ADDR');
    
 CODING GUIDE:
    variable name -> Abc_Xyz_Opq
    comments      -> multi line (must not use single line comment)
    indentation   -> same level
*/
/* 
    SIGNAL Default (client to server)
    - connection            [ parameter: connection object                                               ]
    - disconnect            [ parameter: err object                                                      ]

    SIGNAL List (client to server)
    - Req_Name_Uniqueness   [ parameter: string,    nickname                                             ]
    - Req_Connection        [ parameter: array,     { host_nickname, host_socket_id, partner_nickname }  ]
    - Res_Partnership       [ parameter: array,     { response, host_socket_id, partner_socket_id } ]
    - Req_Chess_Move        [ parameter: array,     { partner_socket_id, move }          	             ]
    - Req_Manual_Disconnect [ parameter: array,     { host_socket_id, partner_socket_id }                ]
	- Req_Chat 				[ parameter: array, 	{ partner_socket_id, chat } 						 ]

    SIGNAL List (server to client)
    - Res_Name_Uniqueness   [ parameter: array,     { response, nickname, host_socket_id }               ]
    - Req_Connection_2      [ parameter: array,     { host_nickname, host_socket_id, partner_socket_id } ]
    - Res_Chess_Move        [ parameter: array,     { move }                                             ]
    - Res_Online_List       [ parameter: array                                                           ]
    - Partner_Disconnected  [ parameter: array,     { host_socket_id, partner_socket_id }                ]
    - Begin_Chess           [ parameter: array,     {partner_nickname,partner_socket_id,i_am_white_army} ]
	- Res_conn_req_rejected [ parameter: bool,    	true 								   		 		 ]
	- Res_Chat 				[ parameter: string 	chat 												 ]			
*/

/* database configurations */
/* run command: heroku config:add [variable]=[value] and use it process.env.[variable] */	
var HOST        = process.env.DB_HOST 			|| 'localhost', 
    USERNAME    = process.env.DB_USERNAME 		|| 'root', 
    PASSWORD    = process.env.DB_PASSWORD 		|| '', 
    DATABASE    = process.env.DATABASE 			|| 'chess';	

/* required Node Modules */
var mysql   = require('mysql');
var express = require('express');

/* configure your app */
var app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server);
    
    app.use(express.static(__dirname + '/Static'));

/* start server */    
var IP      = "192.168.1.1",
    PORT    = process.env.PORT || 5000;

server.listen( PORT /*, IP */);
console.log(
				'\nServer listening at:\t'+
				'\nIP:\t\t' 			+ IP 		+
				'\nPORT:\t\t'			+ PORT 		+
				'\n\nDATABASE Info:' 	+
				'\nHOST:\t\t'			+ HOST 		+
				'\nUSERNAME:\t'			+ USERNAME 	+
				'\nPASSWORD:\t'			+ PASSWORD 	+
				'\nDATABASE:\t'			+ DATABASE	+ '\n'
			);

var db_connection = mysql.createConnection(
                    { 
                        host     : HOST, 
                        user     : USERNAME,
                        password : PASSWORD,
                        database : DATABASE 
                    });
db_connection.connect();

/* optional: exception handling */
process.on('uncaughtException', function (err) {
    console.log(err);
});

/* open the socket connection */
io.sockets.on('connection', function (socket) 
{	
	socket.on('Req_Name_Uniqueness', function (nickname) 
	{
		db_connection.query('SELECT `name` FROM `user` WHERE `name`=?', [nickname], function selectCb(error, results, fields) 
		{
			if (error)
            {
                console.log('GetData Error5: ' + error.message);
                return;
            }
			if(results.length == 0)
			{
				db_connection.query("insert into `user` (`name`, `sid`, `partner`, `inittime`) values (?,?,?,?)", [nickname, socket.id, '',''], function(err, info) 
                {
					if (err)
                    {
                        console.log('GetData Error7: ' + error.message);
                        return;
                    }
				});
                io.sockets.connected[socket.id].emit('Res_Name_Uniqueness', 
                {
                    response        :true, 
                    nickname        :nickname, 
                    host_socket_id  :socket.id
                });
				console.log("Nickname: "+ nickname +" ACCEPTED for SocketID: " + socket.id + "\n");
			}
			else
			{
				io.sockets.connected[socket.id].emit('Res_Name_Uniqueness', 
                {
                    response        : false, 
                    nickname        : nickname, 
                    host_socket_id  : socket.id
                });
				console.log("Nickname ["+ nickname +"] REJECTED for SocketID: " + socket.id + "\n");
			}
			Get_Online_List();
		});
				
	});	


	/* Send request for partnership (Req_Connection: host to server , Req_Connection_2: server to partner) */
	socket.on('Req_Connection', function (data) 
	{
		db_connection.query('SELECT * FROM `user` WHERE `name`=?', [data.partner_nickname], function selectCb(error, results, fields) 
		{
			if (error) 
            {
                console.log('GetData Error5: ' + error.message);
                return;
            }
			if(results.length == 1 && results[0].partner == "")
			{
				console.log(data.host_nickname + " asks " + data.partner_nickname + " for partnership\n");
				io.sockets.connected[results[0].sid].emit('Req_Connection_2', 
                {
                    host_nickname       : data.host_nickname, 
                    host_socket_id      : data.host_socket_id, 
                    partner_socket_id   : results[0].sid
                });			
			}
		});
	});
	
	/* On receiving partnership request confirmation -> begin the game */
	socket.on('Res_Partnership', function (data) 
	{
		if(data.response == true)
        {
			console.log("Partnership ACCEPTED: " + data.host_socket_id + " <-> "+ data.partner_socket_id + "\n");
			Connect_User(data.host_socket_id, data.partner_socket_id);
		}
        else if(data.response == false)
        {
            console.log("Partnership REJECTED: " + data.host_socket_id + " <-> "+ data.partner_socket_id + "\n");
            /* emit to the requester that other person is not interested in playing game with you */
            io.sockets.connected[data.partner_socket_id].emit('Res_conn_req_rejected', true);
        }	        
	});
	
	/* end to end Chess Move */
	socket.on('Req_Chess_Move',  function (data) 
	{
		io.sockets.connected[data.partner_socket_id].emit('Res_Chess_Move', data.move);
	});
	
	/* end to end chat signaling */
	socket.on('Req_Chat', function (data) 
	{
		io.sockets.connected[data.partner_socket_id].emit( 'Res_Chat', data.chat );			
	});
	
	/* Manual disconnect request from one of the partner */	
	socket.on('Req_Manual_Disconnect',  function (data) 
	{
		db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid` IN (?,?)", ["",data.host_socket_id,data.partner_socket_id], function(err, info) 
        {/*callback(info.insertId);*/
        });
		io.sockets.connected[data.partner_socket_id].emit('Partner_Disconnected', data.host_socket_id);
		console.log("Disconnect request: "+ data.host_socket_id + " <-> " + data.partner_socket_id);
		Get_Online_List();
	});
	
    /* Disconnect user in case of -> browser crash, browser close with out manual disconnection */
	socket.on('disconnect', function()
	{
		console.log("User disconnected, ID: "+ socket.id);
        Delete_User(socket.id);
	});
});

/* 
    Function: 
        - Get online users' list & broadcast it 
*/
function Get_Online_List()
{
	db_connection.query('SELECT * FROM `user` WHERE `partner`=?', [""], function selectCb(error, results, fields) 
	{
		if (error)
        {
            console.log('GetData Error1: ' + error.message);
            return;
        }
			
		var user_online = new Array();  
		
        for(var i=0; i<results.length; i++)
		{
			user_online.push(results[i].name);   
		}
		
        io.sockets.emit('Res_Online_List', user_online);
		console.log("Online User List Broadcast.\nTotal:" + results.length + "\n");
	});
}

/* 
    Function: 
        - Delete a user from database when she/he leaves 
        - If needed notify partner that she/he left
*/
function Delete_User(toDlt)
{
	db_connection.query('SELECT `partner` FROM `user` WHERE `sid` = ?', [toDlt], function selectCb(error, results, fields) 
	{
		if (error) 
        {   
            console.log('GetData Error2: ' + error.message);
            return;
        }
		else
        {
            /*if(typeof variable !== 'undefined'){*/
            if(results[0].partner != "")
            {
                io.sockets.connected[results[0].partner].emit('Partner_Disconnected', "");
                db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", ["",results[0].partner], function(err, info)
                {/*callback(info.insertId);*/
                });
            }
            /*}*/
            db_connection.query("DELETE FROM `user` WHERE `sid`=?", [toDlt], function(err2, info) 
            {   /*callback(info.insertId);*/
                if (err2)
                {
                    console.log('GetData Error2: ' + error.message);
                    return;
                }
                else
                {   
                    Get_Online_List();
                }
            });
        }
    });
}

/* 
    Function: 
        - Connect to users
        - Update partner info for both
*/
function Connect_User(host_socket_id, partner_socket_id)
{
	db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", [host_socket_id, partner_socket_id], function(err, info) 
    {/* callback */
    });
	db_connection.query("UPDATE `user` SET `partner`=? WHERE `sid`=?", [partner_socket_id, host_socket_id], function(err2, info2) 
    {/* callback */
    });	 
	
	db_connection.query("SELECT `name`,`sid` FROM `user` WHERE `sid` IN (?,?)", [host_socket_id, partner_socket_id], function selectCb(error, results, fields)
    {
		if (error)
        {
            console.log('GetData Error4: ' + error.message);
            return;
        }
		
		var random_is_white_army = [true,false][Math.round(Math.random())], 
			temp_partner_nickname,
            temp_partner_socket_id;
            
		if(results[0].sid == host_socket_id)
		{
			io.sockets.connected[host_socket_id].emit('Begin_Chess', 
            {
                partner_nickname    : results[1].name, 
                partner_socket_id   : results[1].sid, 
                i_am_white_army     : random_is_white_army
            });
			io.sockets.connected[partner_socket_id].emit('Begin_Chess', 
            {
                partner_nickname    : results[0].name, 
                partner_socket_id   : results[0].sid, 
                i_am_white_army     : !random_is_white_army
            });
		}
		else  /* else if(results[0].sid == partner_socket_id) */
		{
			io.sockets.connected[host_socket_id].emit('Begin_Chess', 
            {
                partner_nickname    : results[0].name, 
                partner_socket_id   : results[0].sid, 
                i_am_white_army     : random_is_white_army
            });
			io.sockets.connected[partner_socket_id].emit('Begin_Chess', 
            {
                partner_nickname    : results[1].name, 
                partner_socket_id   : results[1].sid, 
                i_am_white_army     : !random_is_white_army
            });
		}
		console.log("Game beginning: " + results[0].name + " <-> " + results[1].name + "\n");
	});				
	/* update the available online users */
    Get_Online_List();	
} 
