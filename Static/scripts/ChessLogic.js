/*
    REFERENCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
*/
var WHITE_PIECES = new Array(),
	BLACK_PIECES = new Array();

var White_King_Unicode	        = "&#9812" ,
    White_Queen_Unicode	        = "&#9813" ,
    White_Rook_Unicode	        = "&#9814" ,
    White_Bishop_Unicode	    = "&#9815" ,
    White_Knight_Unicode	    = "&#9816" ,
    White_Pawn_Unicode	        = "&#9817" ,
    Black_King_Unicode	        = "&#9818" ,
    Black_Queen_Unicode	        = "&#9819" ,
    Black_Rook_Unicode	        = "&#9820" ,
    Black_Bishop_Unicode	    = "&#9821" ,
    Black_Knight_Unicode	    = "&#9822" ,
    Black_Pawn_Unicode		    = "&#9823" ;   

/* Class - Chess_Pieces */   
var Chess_Piece = function( _is_color_white ) {
    this.is_color_white = _is_color_white;
};

Chess_Piece.prototype.info      = function(){
  console.log( "I am a piece!" );
};


/* Class - King     : Chess_Piece   */
function King( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "King";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_King_Unicode : Black_King_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode );
};

King.prototype               = Object.create( Chess_Piece.prototype );
King.prototype.constructor   = King;

// Override the "WhoAmI" method
King.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
King.prototype.possible_pos  = function(){
	var POS = new Array();
	POS.push( (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)+1).toString()  );
	POS.push( (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)-1).toString()  );
	POS.push( (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)+1).toString()  );
	POS.push( (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)-1).toString()  );
	POS.push( (parseInt(this.current_column)+1).toString() +  this.current_row.toString()	    		);
	POS.push( (parseInt(this.current_column)-1).toString() +  this.current_row.toString()	    		);
	POS.push(  this.current_column.toString() 			   + (parseInt(this.current_row)+1).toString() );
	POS.push(  this.current_column.toString() 			   + (parseInt(this.current_row)-1).toString() );	
	
	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

King.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};

/* Class - Queen    : Chess_Piece   */
function Queen( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "Queen";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_Queen_Unicode : Black_Queen_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;  
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode );
};

Queen.prototype               = Object.create( Chess_Piece.prototype );
Queen.prototype.constructor   = Queen;

// Override the "WhoAmI" method
Queen.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
Queen.prototype.possible_pos  = function(){
	var POS = new Array();
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	

	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = this.current_row;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = this.current_row;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = this.current_column;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = this.current_column;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

Queen.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};

/* Class - Rook     : Chess_Piece   */
function Rook( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "Rook";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_Rook_Unicode : Black_Rook_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;  
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode );
};

Rook.prototype              = Object.create( Chess_Piece.prototype );
Rook.prototype.constructor  = Rook;

// Override the "WhoAmI" method
Rook.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
Rook.prototype.possible_pos  = function(){
  var POS = new Array();
  
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = this.current_row;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = this.current_row;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = this.current_column;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = this.current_column;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

Rook.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};

/* Class - Bishop   : Chess_Piece   */
function Bishop( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "Bishop";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_Bishop_Unicode : Black_Bishop_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;  
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode );
};

Bishop.prototype             = Object.create( Chess_Piece.prototype );
Bishop.prototype.constructor = Bishop;

// Override the "WhoAmI" method
Bishop.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
Bishop.prototype.possible_pos  = function(){
	var POS = new Array();
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) + i;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = parseInt(this.current_row) + i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	
	
	for(var i=1; i<8; i++)
	{
		var temp_col = parseInt(this.current_column) - i;
		var temp_row = parseInt(this.current_row) - i;
		if( $( "#"+temp_col.toString()+temp_row.toString() ).text() != "" || temp_col>7 || temp_row>7 )
		{
			POS.push( temp_col.toString() + temp_row.toString() );
			break;
		}
		POS.push( temp_col.toString() + temp_row.toString() );
	}	

	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

Bishop.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};

/* Class - Knight   : Chess_Piece   */
function Knight( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "Knight";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_Knight_Unicode : Black_Knight_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;  
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode );
};

Knight.prototype             = Object.create( Chess_Piece.prototype );
Knight.prototype.constructor = Knight;

// Override the "WhoAmI" method
Knight.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
Knight.prototype.possible_pos  = function(){
	var POS = new Array();
	
	POS.push( (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)+2).toString()  );
	POS.push( (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)-2).toString()  );
	POS.push( (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)+2).toString()  );
	POS.push( (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)-2).toString()  );
	POS.push( (parseInt(this.current_column)+2).toString() + (parseInt(this.current_row)+1).toString()  );
	POS.push( (parseInt(this.current_column)+2).toString() + (parseInt(this.current_row)-1).toString()  );
	POS.push( (parseInt(this.current_column)-2).toString() + (parseInt(this.current_row)+1).toString()  );
	POS.push( (parseInt(this.current_column)-2).toString() + (parseInt(this.current_row)-1).toString()  );	
	
	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

Knight.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};

/* Class - Pawn     : Chess_Piece   */
function Pawn( _is_color_white, _init_pos_column, _init_pos_row ) {
  Chess_Piece.call( this, _is_color_white );
  
  this.name                 = "Pawn";
  this.color                = ( _is_color_white == true ) ? "white" : "black";
  this.unicode              = ( _is_color_white == true ) ? White_Pawn_Unicode : Black_Pawn_Unicode;
  this.current_row          = _init_pos_row;
  this.current_column       = _init_pos_column;
  this.is_alive       		= true;  
  $("#Chess_Board").children(".row").children("#"+_init_pos_column.toString()+_init_pos_row.toString()).html( this.unicode ); 
};

Pawn.prototype              = Object.create( Chess_Piece.prototype );
Pawn.prototype.constructor  = Pawn;

// Override the "WhoAmI" method
Pawn.prototype.info          = function(){
    return ("I am " + this.color + this.name + " at POS[" + this.current_row + "," + this.current_column + "]" );
};

// Add methods here
Pawn.prototype.possible_pos  = function(){
	var POS = new Array();
	
	if(this.color == "white")
	{
		if(this.current_row == 2)
		{
			POS.push( this.current_column.toString() + (parseInt(this.current_row)+2).toString()  );
		}
		
		if( $("#"+this.current_column.toString() + (parseInt(this.current_row)+1).toString()).text() == "" )
		{
			POS.push( this.current_column.toString() + (parseInt(this.current_row)+1).toString() );
		}	
		
		var temp_pos 	= (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)+1).toString();
		var temp 		= is_same_color_piece(temp_pos, "white");
		if( $("#"+temp_pos).text() != "" /* not empty*/ && temp === false /* opponent piece is there */)
		{
			POS.push( temp_pos );
		}
		
		temp_pos 		= (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)+1).toString();
		temp 			= is_same_color_piece(temp_pos, "white");
		if( $("#"+temp_pos).text() != "" /* not empty*/ && temp === false /* opponent piece is there */)
		{
			POS.push( temp_pos );
		}
		
	}
	else if(this.color == "black")
	{
		if(this.current_row == 7)
		{
			POS.push( this.current_column.toString() + (parseInt(this.current_row)-2).toString()  );
		}
		
		if( $("#"+this.current_column.toString() + (parseInt(this.current_row)-1).toString()).text() == "" )
		{
			POS.push( this.current_column.toString() + (parseInt(this.current_row)-1).toString() );
		}

		var temp_pos 	= (parseInt(this.current_column)+1).toString() + (parseInt(this.current_row)-1).toString();
		var temp 		= is_same_color_piece(temp_pos, "black");
		if( $("#"+temp_pos).text() != "" /* not empty*/ && temp === false /* opponent piece is there */)
		{
			POS.push( temp_pos );
		}
		
		temp_pos 		= (parseInt(this.current_column)-1).toString() + (parseInt(this.current_row)-1).toString();
		temp 			= is_same_color_piece(temp_pos, "black");
		if( $("#"+temp_pos).text() != "" /* not empty*/ && temp === false /* opponent piece is there */)
		{
			POS.push( temp_pos );
		}		
	}

	var filtered_pos 	= new Array();
	filtered_pos 		= filter_pos(POS, this.color);
	
	return filtered_pos;
};

Pawn.prototype.move_piece  = function(_new_column, _new_row){
	var new_pos 		= _new_column.toString() + _new_row.toString();
	var curr_pos 		= this.current_column.toString() + this.current_row.toString();
	this.current_column = _new_column;
	this.current_row 	= _new_row;
	move_piece(curr_pos, new_pos);	 
};


/* Suport functions */
function move_piece(_curr_pos, _new_pos)
{
	//alert(_curr_pos +"-"+ _new_pos);
	$("#"+_new_pos).html( $("#"+_curr_pos).text() );
	$("#"+_curr_pos).empty();
	//if some piece exist -> set row, col to -1,-1 indicating it is killed
}

function is_same_color_piece(_temp_pos, _color)
{
	/* assumed it is not a empty place -> check it before invocation */
	if( $("#"+_temp_pos).text() == "" )
	{
		return false;
	}	
	
	var temp = $("#"+_temp_pos).text().charCodeAt(0);
		temp = "&#"+temp;
	
	var temp_white_pieces = new Array(5);
	
	temp_white_pieces.push(	
							White_King_Unicode, 
							White_Queen_Unicode, 
							White_Rook_Unicode, 
							White_Bishop_Unicode, 
							White_Knight_Unicode, 
							White_Pawn_Unicode
						);
							
	var temp_color = (jQuery.inArray( temp, temp_white_pieces ) !== -1 )?"white":"black";
	if ( _color == temp_color ){
		return true;
	}
	return false;
}

function filter_pos(_POS, _color)
{
	var new_pos = new Array();
	
	for(var i=0; i<_POS.length; i++)
	{
		if( $("#"+_POS[i]).text() == "")
		{
			
			new_pos.push( _POS[i] );
		}
		else
		{
			if( is_same_color_piece( _POS[i], _color ) === false )
			{
				new_pos.push( _POS[i] );
			}
		}
	}
	return new_pos;
}

/* used in main.js */
function find_piece_at_pos(_pos)
{
	var temp = $("#"+_pos).text();
		temp = "&#"+temp.charCodeAt(0);
	
	if(temp == White_King_Unicode )
	{
		return "White_King";
	}	
	else if(temp == White_Queen_Unicode )
	{
		return "White_Queen";
	}	
    else if(temp == White_Rook_Unicode )
	{
		return "White_Rook";
	}	    
	else if(temp == White_Bishop_Unicode )
	{
		return "White_Bishop";
	}			
	else if(temp == White_Knight_Unicode )
    {
		return "White_Knight";
	}	
	else if(temp == White_Pawn_Unicode )
    {
		return "White_Pawn";
	}	
	else if(temp == Black_King_Unicode )
    {
		return "Black_King";
	}	
	else if(temp == Black_Queen_Unicode )
    {
		return "Black_Queen";
	}	
	else if(temp == Black_Rook_Unicode )
    {
		return "Black_Rook";
	}	
	else if(temp == Black_Bishop_Unicode )
    {
		return "Black_Bishop";
	}	
	else if(temp == Black_Knight_Unicode )
    {
		return "Black_Knight";
	}	
	else if(temp == Black_Pawn_Unicode )
	{
		return "Black_Pawn";
	}	
	return -1;
}

function find_legal_POS(_piece, _id)
{
	var temp_color 	= _piece.substring(0,5),
		avail_POS	= new Array();

	if( temp_color == 'white' )
	{
		for(var i=0; i<WHITE_PIECES.length; i++)
		{
			if( WHITE_PIECES[i].current_column.toString() + WHITE_PIECES[i].current_row.toString() == _id )
			{
				avail_POS = WHITE_PIECES[i].possible_pos();
				break;
			} 
		}	  
	}
	else if( temp_color == 'black' )
	{
		for(var i=0; i<BLACK_PIECES.length; i++)
		{
			if( BLACK_PIECES[i].current_column.toString() + BLACK_PIECES[i].current_row.toString()  == _id )
			{
				avail_POS = BLACK_PIECES[i].possible_pos();
				break;
			} 
		}		
	}
		
	return avail_POS;	
}

function find_n_move_obj(_piece, _id, _new_column, _new_row)
{
	var temp_color 	= _piece.substring(0,5),
		avail_POS	= new Array();
	
	//alert("moving "+_piece +" from "+ _id +" to "+ _new_column.toString() + _new_row.toString());
	
	if( temp_color == 'white' )
	{
		for(var i=0; i<WHITE_PIECES.length; i++)
		{
			if( WHITE_PIECES[i].current_column.toString() + WHITE_PIECES[i].current_row.toString() == _id )
			{
				WHITE_PIECES[i].move_piece(_new_column, _new_row);
				break;
			} 
		}	  
	}
	else if( temp_color == 'black' )
	{
		for(var i=0; i<BLACK_PIECES.length; i++)
		{
			if( BLACK_PIECES[i].current_column.toString() + BLACK_PIECES[i].current_row.toString()  == _id )
			{
				BLACK_PIECES[i].move_piece(_new_column, _new_row);
				break;
			} 
		}		
	}	
}

function find_piece_info(_piece, _id)
{
	var temp_color 	= _piece.substring(0,5),
		avail_POS	= new Array();
	
	if( temp_color == 'white' )
	{
		for(var i=0; i<WHITE_PIECES.length; i++)
		{
			if( WHITE_PIECES[i].current_column.toString() + WHITE_PIECES[i].current_row.toString() == _id )
			{
				return WHITE_PIECES[i].info();
			} 
		}	  
	}
	else if( temp_color == 'black' )
	{
		for(var i=0; i<BLACK_PIECES.length; i++)
		{
			if( BLACK_PIECES[i].current_column.toString() + BLACK_PIECES[i].current_row.toString()  == _id )
			{
				return BLACK_PIECES[i].info();
			} 
		}		
	}	
}

function setup_game(_new)
{
/* GLOBAL DECLARATION
	
	var WHITE_PIECES = new Array(),
		BLACK_PIECES = new Array();
*/		
	if(_new === true)
	{
		WHITE_PIECES.push( new Pawn(true, 1, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 2, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 3, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 4, 2)	 	);
		WHITE_PIECES.push( new Pawn(true, 5, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 6, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 7, 2) 	);
		WHITE_PIECES.push( new Pawn(true, 8, 2) 	);		
		
		WHITE_PIECES.push( new Rook(true, 1, 1) 	);
		WHITE_PIECES.push( new Knight(true, 2, 1) 	);
		WHITE_PIECES.push( new Bishop(true, 3, 1) 	);
		WHITE_PIECES.push( new Queen(true, 4, 1) 	);
		WHITE_PIECES.push( new King(true, 5, 1) 	);
		WHITE_PIECES.push( new Bishop(true, 6, 1) 	);
		WHITE_PIECES.push( new Knight(true, 7, 1) 	);
		WHITE_PIECES.push( new Rook(true, 8, 1) 	);

		BLACK_PIECES.push( new Pawn(false, 1, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 2, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 3, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 4, 7)	);
		BLACK_PIECES.push( new Pawn(false, 5, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 6, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 7, 7) 	);
		BLACK_PIECES.push( new Pawn(false, 8, 7) 	);		
		
		BLACK_PIECES.push( new Rook(false, 1, 8) 	);
		BLACK_PIECES.push( new Knight(false, 2, 8) 	);
		BLACK_PIECES.push( new Bishop(false, 3, 8) 	);
		BLACK_PIECES.push( new Queen(false, 4, 8) 	);
		BLACK_PIECES.push( new King(false, 5, 8) 	);
		BLACK_PIECES.push( new Bishop(false, 6, 8) 	);
		BLACK_PIECES.push( new Knight(false, 7, 8) 	);
		BLACK_PIECES.push( new Rook(false, 8, 8) 	);		
	}	
}

function end_game()
{
	
}
