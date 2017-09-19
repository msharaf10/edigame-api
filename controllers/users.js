const User = require( '../models/schemas/user' );
const Team = require( '../models/schemas/team' );
const helperss = require( '../models/helpers' );

exports.getUsers = ( req, res, next ) => {
	User.find( {} ).exec()
	.then( ( users ) => {
		res.status( 200 ).json( users );
	}).catch( ( err ) => next( err ) );
}

exports.createUser = ( req, res, next ) => {

	// Check requierd params
	let requiredParams = [
		'firstName',
		'lastName',
		'username',
		'phone',
		'email',
		'password'
	],
		errorParam = false;

	requiredParams.forEach( ( param ) => {
		if ( errorParam ) return;

		if ( param === 'firstName' && ( typeof req.body.firstName !== 'string' || !req.body.firstName.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}

		if ( param === 'lastName' && ( typeof req.body.lastName !== 'string' || !req.body.lastName.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}

		if ( param === 'phone' && ( typeof req.body.phone !== 'string' || !req.body.phone.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}

		if ( param === 'username' && ( typeof req.body.username !== 'string' || !req.body.username.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}

		if ( param === 'email' && ( typeof req.body.email !== 'string' || !req.body.email.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}

		if ( param === 'password' && ( typeof req.body.password !== 'string' || !req.body.password.length ) ) {
			errorParam = 'Missing requierd ' + param;
		}
	});

	if ( errorParam ) return res.status( 400 ).send( errorParam );

	// validate username
	if ( req.body.username.length <= 7 )
		return res.status( 400 ).send( 'username must be more than 7 chars' );

	// validate password
	if ( req.body.password.length <= 7 )
		return res.status( 400 ).send( 'password must be more than 7 chars' );

	// validate email
	if ( !( helpers.regex.validEmail ).test( req.body.email ) )
		return res.status( 400 ).send( 'Invalid email' );

	// validate phone
	if ( !( helpers.validPhone( req.body.phone ) ) )
		return res.status( 400 ).send( 'Invalid phone' );

	let newUser = new User();

	newUser.firstName = req.body.firstName;
	newUser.lastName = req.body.lastName;
	newUser.username = req.body.username;
	newUser.phone = req.body.phone;
	newUser.email = req.body.email;
	newUser.hash = req.body.password;
	newUser.profPic = { // ignore this for now :D
		x: req.body['profPic[x]'],
		y: req.body['profPic[y]']
	};

	newUser.save().then( () => {
		next();
	}).catch( ( err ) => {
		if ( err.code === 11000 ) {

			var field = err.message.split( 'index: ' )[ 1 ];
			field = field.split( ' dup key' )[ 0 ];
			field = field.substring( 0, field.lastIndexOf( '_' ) );

			if ( field === 'email' ) {
				return res.status( 400 ).send( 'Email already registered' );
			}
			if ( field === 'phone' ) {
				return res.status( 400 ).send( 'phone already registered' );
			}
			if ( field === 'username' ) {
				return res.status( 400 ).send( 'username already registered' );
			}
		}
		next( err );
	});
}

exports.getUserById = ( req, res, next ) => {
	User.findById( req.params.id ).exec()
	.then( ( user ) => {
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		res.status( 200 ).send( user );
	}).catch( ( err ) => next( err ) );
}

exports.getUserByUsername = ( req, res, next ) => {
	User.findOne( { 'username': req.query.q || req.params.username || req.body.username }, {} ).exec()
	.then( ( user ) => {
		if ( !user ) return res.status( 404 ).send( 'No user with that username' );
		res.status( 200 ).send( user );
	}).catch( ( err ) => next( err ) );
}

// TODO search for user Algorithm

exports.getTeam = ( req, res, next ) => {
	Team.findOne( { 'teamName': req.query.name || req.params.name }, {} ).exec()
	.then( ( team ) => {
		if ( !team ) return res.status( 404 ).send( 'No team with that name' );
		if ( !team.players.length ) return res.status( 200 ).send( [], team.companyName );

		req.company = team.companyName;
		req.team = team._id;
		next();

	}).catch( ( err ) => next( err ) );
}

exports.getUsersOfTeam = ( req, res, next ) => {
	User.find( { 'team': req.team }, {} ).exec()
	.then( ( users ) => {
		// remove admin from array
		var adminIndex = users.findIndex( ( user ) => user[ 'isAdmin' ] == true );
		var admin = users.splice( adminIndex, 1 );

		res.status( 200 ).send( [ users, req.company, req.team ] );
	}).catch( ( err ) => next( err ) );
}

exports.updateUserById = ( req, res, next ) => {
	// TODO validation
	// TODO make user updates only basic information to
	// avoid changing sensitive information e.g. isAdmin or started.
	User.findByIdAndUpdate( req.params.id, req.body ).exec()
	.then( ( user ) => {
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		res.sendStatus( 200 );
	}).catch( ( err) => {
		if ( err.code === 11000 )
			return res.status( 400 ).send( 'phone, email or username already token' );
		next( err );
	});
}

exports.deleteUserById = ( req, res, next ) => {
	User.findByIdAndRemove( req.params.id || req.body.id ).exec()
	.then( ( user ) => {
		if ( !user ) return res.status( 404 ).send( 'No user with that ID' );
		res.sendStatus( 200 );
	}).catch( ( err ) => next( err ) );
}
