/*
 AUTHOR: Adesh Shah
 AdeshShah.com
 (+91) 942 88 999 25
 
 First commit	: 17/Mar/2015	{ base socket functionality 			}
 Second commit	: 01/Oct/2015 	{ object oriented paradigm implemented 	}
 
 To run app:
 -> unzip -> chess.zip
 -> command prompt: navigate to the directory and enter 'node ChessServer.js'
 -> open 2 browser tabs (chrome suggested) -> visit: localhost:8080 in both tabs
    
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
/*
    STEPS
    - Step.1) ask for a nickname until it is unique and set it
    - Step.2) show online available users
    - Step.3) connect to a partner for a game (either send request or wait for one)
    - Step.4) set up game & perform moves (either send request or wait for one)
    - Step.5) let them disconnect
    - Step.6) provide UI support functions
*/
var socket = io();

var NICKNAME            = "",
    MY_SOCKET_ID        = "",
    PARTNER_SOCKET_ID   = "",
    PARTNER             = "",
    GAME_ON             = false,
    LET_OTHER_CONNECT   = true,     /* CONNECT REQUEST SENT & WAITING FOR ACCEPTENCE */
    IAM_WHITE_ARMY      = false,
	FIRST_CLICKED 		= false,
	FIRST_CLICKED_id 	= "",
	FIRST_CLICKED_piece = "",
	AVAIL_FILTERED_POS 	= new Array(),
	MY_TURN				= false;    
/* 
    Step.1
    - Set up nick name 
*/    
var NICKNAME_SETUP_DONE = false;    

PickNickName ( );

function PickNickName ()
{
    while( NICKNAME == "" || NICKNAME.length<3 || NICKNAME.length>9 || NICKNAME.search(" ")>0 )
    {
        NICKNAME = prompt("Pick a Nickname", "");
        /* if prompt is cancelled, it returns 'null' */
        if( NICKNAME === null )
        {
            NICKNAME="";
        }    
    }    

    /* Send Req_Name_Uniqueness to Server */
    socket.emit('Req_Name_Uniqueness', NICKNAME);
        
    /* wait for Res_Name_Uniqueness */
}

socket.on('Res_Name_Uniqueness', function (data)
{
    if(data.response != true)
    {
        NICKNAME = "";
        PickNickName ( );
    }
    else
    {
        NICKNAME_SETUP_DONE = true;
        MY_SOCKET_ID        = data.host_socket_id;
        $("left_column").append(NICKNAME+"<br/>"+MY_SOCKET_ID);
    }
}); 

/*
    Step.2 
    - Show on-line available users
*/
socket.on('Res_Online_List', function (data)
{
    if(NICKNAME_SETUP_DONE == false)
    {
        return;
    }
    $("#Available_Users").empty();
    $("#Available_Users").append("Available players<br/><br/>");
	for(var i=0; i<data.length; i++)
    {
        if(data[i] != NICKNAME)
        {
            $("#Available_Users").append("<li><a class='Available_User'>" + data[i] + "</a></li>");
        }    
    }
}); 

/*
    Step.3
    - Connect to a partner for a game (either send request or wait for one)
*/
/* add eventHandler dynamically (this links are created after page loading) */
$(document).ready(function(){
    $(document.body).on("click", ".Available_User", function(){
        Request_to_Connect(this);
    });
});

/* Option 1: connect to user */    
function Request_to_Connect(DomObj)
{
    if( GAME_ON == false && NICKNAME_SETUP_DONE == true && NICKNAME != "" )
    {
        future_partner = $(DomObj).text();
        var Confirmation = confirm("Do you want to connect to " + future_partner + " ?");
        if( Confirmation == false)
        {
            return;
        }
        else
        {
            socket.emit('Req_Connection', {
                                            host_nickname    : NICKNAME, 
                                            host_socket_id   : MY_SOCKET_ID, 
                                            partner_nickname : future_partner
                                        });
            LET_OTHER_CONNECT = false;                             
        }
    }   
    else
    {
        alert("Game is already on!\nDisconnect existing connection first.");
    }
}

/* Option 2: wait for user to connect */ 
socket.on('Req_Connection_2', function (data)
{
    if(LET_OTHER_CONNECT == false)
    {
        /* reject the request as you are waiting for someone to accept your request */
        socket.emit('Res_Partnership', {
                                        response          : false, 
                                        host_socket_id    : MY_SOCKET_ID, 
                                        partner_socket_id : data.host_socket_id
                                    });        
    }
    else
    {
        /* host nickname in this case is other persons id */
        var Confirmation = confirm(data.host_nickname + " wants to connect with you?\nDo you accept?");
        socket.emit('Res_Partnership', {
                                        response          : Confirmation, 
                                        host_socket_id    : MY_SOCKET_ID, 
                                        partner_socket_id : data.host_socket_id
                                    });
    }
});   

/* If Response is negative (partner do not want to connect or she/he is waiting for some else to accept her request ) */
//yet to implement

socket.on('Res_conn_req_rejected', function (data)
{
	alert("Connection request rejected!\n Try to connect to some one else.");
	PARTNER_SOCKET_ID   = "",
    PARTNER             = "",
    GAME_ON             = false,
    LET_OTHER_CONNECT   = true;
});

/*
    Step 4
        - set up game & perform moves (either send request or wait for one)
*/
socket.on('Begin_Chess', function (data)
{
    /* { partner_nickname, partner_socket_id, i_am_white_army } */
	setup_game(true);
	
	if( data.i_am_white_army === false )
	{
		IAM_WHITE_ARMY 	= data.i_am_white_army;
		MY_TURN 		= false;
		Rotate_Chess_Board();
		$("#My_Turn").css({'background':'red'});		
	}
	else if( data.i_am_white_army === true )
	{
		IAM_WHITE_ARMY 	= data.i_am_white_army;
		MY_TURN 		= true;
		$("#My_Turn").css({'background':'lightgreen'});
	}
	PARTNER_SOCKET_ID   = data.partner_socket_id,
    PARTNER             = data.partner_nickname,
    GAME_ON             = true,
    LET_OTHER_CONNECT   = false;
	$("#Available_Users").fadeOut();
	$("#Move_History").empty();
});

$(document).ready(function()
{	
	$(".White_Cell, .Black_Cell").click( function()
	{	
		if( GAME_ON === true && MY_TURN === true )
		{
			if( FIRST_CLICKED == false )
			{
				var temp = is_same_color_piece( $(this).attr("id"), (IAM_WHITE_ARMY==true?"white":"black") );
				if( $(this).text() != "" && temp == true )
				{
					FIRST_CLICKED = true;
					
					FIRST_CLICKED_id 		= $(this).attr('id'),
					FIRST_CLICKED_piece 	= find_piece_at_pos( $(this).attr('id') ).toLowerCase();
					
					AVAIL_FILTERED_POS = find_legal_POS(FIRST_CLICKED_piece, FIRST_CLICKED_id);	/* from ChessLogic.js */
					
					
					for(var i=0; i<AVAIL_FILTERED_POS.length; i++)
					{
						$("#"+AVAIL_FILTERED_POS[i]).css({'background':'cyan'});	
					}	
					
					$(this).css({'background':'lightgreen'});
					$("#My_Turn").css({'background':'cyan'});
					$("#Piece_Info").html(find_piece_info(FIRST_CLICKED_piece, FIRST_CLICKED_id));
				}	
			}
			else if( FIRST_CLICKED == true )
			{
				$(".White_Cell").css({'background':'#ffffff'});
				$(".Black_Cell").css({'background':'#f5f5f5'});		
				
				var temp = is_same_color_piece( $(this).attr("id"), (IAM_WHITE_ARMY==true?"white":"black") );
				
				if( temp === true && $(this).text() != "" )
				{	/* first click done but reselection of a piece */
					
					FIRST_CLICKED = true;
					
					FIRST_CLICKED_id 		= $(this).attr('id'),
					FIRST_CLICKED_piece 	= find_piece_at_pos( $(this).attr('id') ).toLowerCase();
					
					AVAIL_FILTERED_POS = find_legal_POS(FIRST_CLICKED_piece, FIRST_CLICKED_id);	/* from ChessLogic.js */
					
					for(var i=0; i<AVAIL_FILTERED_POS.length; i++)
					{
						$("#"+AVAIL_FILTERED_POS[i]).css({'background':'cyan'});	
					}	
					
					$(this).css({'background':'lightgreen'});
					$("#My_Turn").css({'background':'cyan'});
					$("#Piece_Info").html(find_piece_info(FIRST_CLICKED_piece, FIRST_CLICKED_id));
				}
				else if( (temp === false && $(this).text() == "") /* putting it on an empty space */ || ( temp === false && $(this).text() != "" ) /* killing opponent piece */ )
				{	
					var temp_id = $(this).attr("id");
					if( jQuery.inArray( temp_id, AVAIL_FILTERED_POS ) != -1)
					{
						var temp_move 		= FIRST_CLICKED_id+"-"+temp_id,
							killed_piece 	= "",
							temp_piece 		= $("#"+temp_id).text();
						
						if( temp_piece != "" )
						{
							killed_piece = "("+temp_piece.charCodeAt(0)+")";	
						}
					
						$("#Move_History").append( temp_move + killed_piece + "," );	
						
						find_n_move_obj(
											FIRST_CLICKED_piece, 
											FIRST_CLICKED_id, 
											temp_id.substring(0,1), 
											temp_id.substring(1)
										);
						
						socket.emit('Req_Chess_Move', {
                                            partner_socket_id   : PARTNER_SOCKET_ID, 
                                            move 				: temp_move
                                        });
						
						MY_TURN = false;
						FIRST_CLICKED = false;
						AVAIL_FILTERED_POS 		= [];
						FIRST_CLICKED_id 		= "";
						FIRST_CLICKED_piece 	= "";
						$("#My_Turn").css({'background':'red'});
						$("#Piece_Info").empty();					
					}
				}
			}	
		}
	});
});

socket.on('Res_Chess_Move', function (move)
{
	var temp 	= move.split("-"),
		fromID 	= temp[0],
		t_col 	= temp[1],
		t_row	= temp[1],
		t_col 	= t_col.substring(0,1),
		t_row	= t_row.substring(1);

	if( GAME_ON == true && MY_TURN === false )
	{
		var killed_piece 	= "",
			temp_piece 		= $("#"+temp[1]).text();
		if( temp_piece != "" )
		{
			killed_piece = "("+temp_piece.charCodeAt(0)+")";	
		}	
		$("#Move_History").append(  move + killed_piece + "," );
		
		find_n_move_obj( 
							find_piece_at_pos( move.substring(0,2) ).toLowerCase(), 
							fromID, 
							parseInt(t_col), 
							parseInt(t_row) 
						);
		
		MY_TURN = true;
		$("#My_Turn").css({'background':'lightgreen'});
	}
});

/* let them undo - yet to implement */

socket.on('Do_Undo', function (data)
{
	if(data.res == true)
	{
		
	}
	else
	{
		if(data.req_maker_id == MY_SOCKET_ID){
			alert("Undo request rejected by "+ PARTNER);			
		}
	}
});

socket.on('Req_Undo_2', function (data)
{
	var Confirmation = confirm(PARTNER + "asks for undo.\nDo you want to allow?");
    if( Confirmation == true)
    {
		socket.emit('Res_Undo', {
												res					: true,
												host_socket_id		: MY_SOCKET_ID,
												partner_socket_id   : PARTNER_SOCKET_ID,
												move				: ""
									});
	}
	else
	{
		socket.emit('Res_Undo', {
												res					: false,
												host_socket_id		: MY_SOCKET_ID,
												partner_socket_id   : PARTNER_SOCKET_ID,
												move				: ""
									});
	}
});

$(document).ready(function()
{
    $("#Undo_Chess_Board_Button").click( function () 
    {
        var Confirmation = confirm("Do you want ask " + PARTNER + " for undo?");
        if( Confirmation == true)
        {
			socket.emit('Req_Undo', {
												host_socket_id		: MY_SOCKET_ID,
												partner_socket_id   : PARTNER_SOCKET_ID,
												move				: ""
									});
																						
        }
    });
});

/* Story: As a user I want to chat with my partner */
$(document).ready(function()
{
    $(document).keypress(function(e){
		if (e.which == 13){
			Send_Chat();
		}
	});
	
	$("#Send_Chat").click( function () 
    {
		Send_Chat();
    });
});
	
	
function Send_Chat()
{
	var temp_chat = stripHTML($("#Type_Chat").val());
	if( temp_chat != "" )	
	{	
		socket.emit('Req_Chat', {
									partner_socket_id   : PARTNER_SOCKET_ID,
									chat				: temp_chat
								});
								
		$("#Chat_Archive").append("<div class='from_me'>" + temp_chat + "</div>");
		$('#Chat_Archive').scrollTop($('#Chat_Archive')[0].scrollHeight);
		$("#Type_Chat").val("");
    }	
}

/* suport function to remove HTML tags from CHAT string */
function stripHTML(dirtyString)
{
	var container = document.createElement('div');
	var text = document.createTextNode(dirtyString);
	container.appendChild(text);
	return container.innerHTML; /* innerHTML will be a XSS safe string */
}
	
socket.on('Res_Chat', function (chat)
{
	$("#Chat_Archive").append("<div class='from_partner'>"+chat+"</div>");
	$('#Chat_Archive').scrollTop($('#Chat_Archive')[0].scrollHeight);
});

/*
    step 5
        - let them disconnect
*/

$(document).ready(function()
{
    $("#Disconnect_Chess_Board_Button").click( function () 
    {
        var Confirmation = confirm("Do you want to disconnect to " + PARTNER + " ?");
        if( Confirmation == true)
        {
			socket.emit('Req_Manual_Disconnect', {
												host_socket_id		: MY_SOCKET_ID,
												partner_socket_id   : PARTNER_SOCKET_ID
											});
											
			if( IAM_WHITE_ARMY === false )
			{
				Rotate_Chess_Board();
			}
			
			$(".White_Cell, .Black_Cell").empty();
			end_game();
			PARTNER_SOCKET_ID   = "";
			PARTNER             = "";
			GAME_ON             = false;
			LET_OTHER_CONNECT   = true;     /* CONNECT REQUEST SENT & WAITING FOR ACCEPTENCE */
			IAM_WHITE_ARMY      = false;
			FIRST_CLICKED 		= false;
			AVAIL_FILTERED_POS 	= [];
			MY_TURN				= false;
			$(".White_Cell").css({'background':'#ffffff'});
			$(".Black_Cell").css({'background':'#f5f5f5'});
			$("#Available_Users").fadeIn();
			$("#Chat_Archive").empty();
			$("#Move_History").empty();			
        }
    });
});

socket.on('Partner_Disconnected', function (data)
{
    /* { host_socket_id, partner_socket_id } */
    alert("Partner disconnected!");
    
	if( IAM_WHITE_ARMY === false )
	{
		Rotate_Chess_Board();
	}
	
	$(".White_Cell, .Black_Cell").empty();
	end_game();
    PARTNER_SOCKET_ID   = "";
    PARTNER             = "";
    GAME_ON             = false;
    LET_OTHER_CONNECT   = true;     /* CONNECT REQUEST SENT & WAITING FOR ACCEPTENCE */
    IAM_WHITE_ARMY      = false;
	FIRST_CLICKED 		= false;
	AVAIL_FILTERED_POS 	= [];
	MY_TURN				= false;
	$(".White_Cell").css({'background':'#ffffff'});
	$(".Black_Cell").css({'background':'#f5f5f5'});
	$("#Available_Users").fadeIn();	
	$("#Chat_Archive").empty();
	$("#Move_History").empty();
	
});

/*
    step 6
        - provide UI support functions
*/

/* Story: As a user I want to rotate the board */

function Rotate_Chess_Board()
{
    /* SWAP rows */
	for(var i=1; i<8; i++)
    {
        $( ".row:nth-child(8)" ).insertAfter( ".row:nth-child("+i+")" );
    }
	$( ".row:nth-child(1)" ).insertAfter( ".row:nth-child(8)" );
	
	/* SWAP cells */	
	for(var i=1; i<9; i++)
	{
		var Temp_Row 	= $("#row_"+i);
		for(var j=1; j<8; j++)
		{		
			Temp_Row.children(":nth-child(8)").insertAfter( Temp_Row.children(":nth-child(" + j + ")") );
		}
		Temp_Row.children(":nth-child(1)").insertAfter( Temp_Row.children(":nth-child(8)") );
	}
}

$(document).ready(function()
{
    $("#Rotate_Chess_Board_Button").click( function () 
    {
        Rotate_Chess_Board();
    });
});


/* Story: As a developer I want to make Available_Users & Notification infomation look beautiful */

/* resize routines */
$(document).ready(function()
{
	resize();
	
	$( window ).resize(function()
	{
		resize();
	});
});
	
var resize = function()
{
	var h = $(window).height() ;
	var w = $(window).width();
       
    $("body, #Notification").css({ 'height':h ,'width':w});	   
    $("body, #Available_Users").css({ 'height':h ,'width':w});
	$("#main_column").css({ 'top':(h-$("#main_column").height())/2 - h/20});
	$("#Chat").css({ 'left':(w - 400)/2});
	$('#Chat_Archive').scrollTop($('#Chat_Archive')[0].scrollHeight);
}
	
var notify = function(){
    /* override alert() method */
}

/* Story: As a pro-developer, i want to see the game moves history, selected piece info and game info */
$(document).ready(function()
{
	
	$(document).keypress(function(e)
	{
		
		if(e.keyCode == 109 ) /* m */
		{
			alert("Moves\n\n"+$("#Move_History").text());
		}
		
		if(e.keyCode == 112 ) /* p */
		{
			alert("Piece_Info\n\n"+$("#Piece_Info").text());
		}
		
		if(e.keyCode == 105 ) /* i */
		{
			alert
			(
				"Game info \n\n"		+
				"NICKNAME: " 			+ NICKNAME 				+ "\n" +
				"MY_SOCKET_ID: " 		+ MY_SOCKET_ID			+ "\n" +
				"PARTNER_SOCKET_ID: " 	+ PARTNER_SOCKET_ID		+ "\n" +
				"PARTNER: " 			+ PARTNER				+ "\n" +
				"GAME_ON: " 			+ GAME_ON				+ "\n" +
				"LET_OTHER_CONNECT: " 	+ LET_OTHER_CONNECT		+ "\n" +
				"IAM_WHITE_ARMY: " 		+ IAM_WHITE_ARMY		+ "\n" +
				"FIRST_CLICKED: " 		+ FIRST_CLICKED			+ "\n" +
				"FIRST_CLICKED_id: " 	+ FIRST_CLICKED_id		+ "\n" +
				"FIRST_CLICKED_piece: "	+ FIRST_CLICKED_piece	+ "\n" +
				"AVAIL_FILTERED_POS: " 	+ AVAIL_FILTERED_POS	+ "\n" +
				"MY_TURN: " 			+ MY_TURN		
			);
		}
	});		
});	
