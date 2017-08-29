const User = require( '../models/schemas/user' );

exports.getUsers = ( req, res, next ) => {
	User.find( {}, ( err, users ) => {
		if ( err ) return next( err );
		return res.json( users );
	});
}

exports.createUser = ( req, res, next ) => {
	var newUser = new User( req.body );
	newUser.save( ( err ) => {
		if ( err ) {
			if ( err.code === 11000 ) return res.status( 400 ).send( 'you are already registered' );
			return next( err );
		}
	return res.sendStatus(200);
	});
}

exports.updateUserById = ( req, res, next ) => {
	User.fineByIdAndUpdate( req.params.id, req.body, ( err, user ) => {
		if ( err ) return next( err );
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		return res.sendStatus( 200 );
	});
}

exports.deleteUserById = ( req, res, next ) => {
	User.findByIdAndRemove( req.params.id, ( err, user ) => {
		if ( err ) return next( err );
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		return res.sendStatus( 200 );
	});
}

