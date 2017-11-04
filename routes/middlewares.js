const { validID } = require( '../helpers/helpers' );

// validate objects ID
exports.validateIDs = ( req, res, next ) => {

	let params = [ 'userId', 'teamId', 'adminId' ],
		invalidParam = false;

	params.forEach( param => {
		if ( invalidParam ) return;

		if ( req.body[ param ] && !validID( req.body[ param ] ) )
			invalidParam = 'invalid id';
	});

	if ( invalidParam )
		return res.status( 400 ).json( { error: invalidParam } );

	next();
}
