const User = require( '../models/schemas/user' );
const config = require( '../models/config' );

exports.getUsers = ( req, res, next ) => {
	User.find( {}, ( err, users ) => {
		if ( err ) return next( err );
		return res.json( users );
	});
}

exports.createUser = ( req, res, next ) => {
	if ( typeof req.body.email !== 'string' )
		return res.status( 400 ).send( 'No email');
	if ( typeof req.body.password !== 'string' )
		return res.status( 400 ).send( 'No password' );
	if ( typeof req.body.username !== 'string' )
		return res.status( 400 ).send( 'No username' );

	let userData = {};

	if ( req.body.firstName && typeof req.body.firstName === 'string' )
		userData.firstName = req.body.firstName;
	if ( req.body.lastName && typeof req.body.lastName === 'string' )
		userData.lastName = req.body.lastName;
	if ( req.body.username && typeof req.body.username === 'string' )
		userData.username = req.body.username;
	if ( req.body.companyName && typeof req.body.companyName === 'string' )
		userData.companyName = req.body.companyName;
	if ( req.body.phone && typeof req.body.phone === 'string' )
		userData.phone = req.body.phone;
	if ( req.body.password && typeof req.body.password === 'string' )
		userData.hash = req.body.password;
	if ( req.body.isAdmin )
		userData.isAdmin = true;
	if ( req.body.email && typeof req.body.email === 'string' ) {
		if ( !( config.regex ).test( req.body.email ) )
			return res.status( 400 ).send( 'Invalid email' );
		userData.email = req.body.email;
	}

	let newUser = new User( userData );
	newUser.save( ( err ) => {
		if ( err ) {
			if ( err.code === 11000 ) return res.status( 400 ).send( 'Email, phone or userName already registered' );
			return next( err );
		}
		return res.sendStatus( 200 );
	});
}

exports.getUserById = ( req, res, next ) => {
	User.findById( req.params.id, ( err, user ) => {
		if ( err ) return next( err );
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		return res.status( 200 ).send( user );
	});
}

exports.getUserByUsername = ( req, res, next ) => {
	const fields = '_id userName email team isAdmin isLeader companyName';
	User.find( { 'userName': req.params.userName || req.body.userName }, fields, ( err, user ) => {
		if ( err ) return next( err );
		if ( !user ) return res.status( 404 ).send( 'No user with that username' );
		return res.status( 200 ).send( user );
	});
}

// TODO search for user Algorithm

exports.getTeamUsers = ( req, res, next ) => {
	const fields = '_id userName email team isAdmin isLeader companyName'
	User.find( { 'team': req.params.teamId || req.body.teamId }, fields, ( err, users ) =>{
		if ( err ) return next( err );
		if ( !users ) return res.status( 'No users with this team' );
		return res.status( 200 ).send( users );
	});
}

exports.updateUserById = ( req, res, next ) => {
	User.findByIdAndUpdate( req.params.id, req.body, ( err, user ) => {
		if ( err ) {
			if ( err.code === 11000 )
				return res.status( 400 ).send( 'phone, email or username already token' );
			return next( err );
		}
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
