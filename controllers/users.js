const User = require( '../models/schemas/user' );
const Team = require( '../models/schemas/team' );

const constants = require( '../models/constants' );

const { FIELDS } = constants;
const { SUPERADMIN, ADMIN, CLIENT } = constants.userRoles;
const { ADMIN_PROMOTION, ADMIN_DEMOTION } = constants.subjects;
const { validName, validEmail, validID, catchDuplicationKey } = require( '../helpers/helpers' );

exports.getUsers = ( req, res, next ) => {
	// filter => ignore super admins
	let filter = {
		$or: [
			{ role : CLIENT },
			{ role : ADMIN }
		]
	};

	User.find( filter, FIELDS ).exec()
		.then( users => res.status( 200 ).json( users ) )
		.catch( err => next( err ) );
}

exports.createUser = ( req, res, next ) => {

	// Required params
	let requiredParams = [
		'firstName',
		'lastName',
		'username',
		'email',
		'password'
	],
		missingParam = false;

	// Check required params
	requiredParams.forEach( param => {
		if ( missingParam ) return;

		if ( !req.body[ param ] || typeof req.body[ param ] !== 'string' || !req.body[ param ].length )
			missingParam = `missing ${ param }`;
	});

	if ( missingParam )
		return res.status( 400 ).json( { error: missingParam } );

	// validate username
	if ( !validName( req.body.username ) )
		return res.status( 400 ).json( { error: 'invalid username' } );

	// validate password
	if ( req.body.password.length <= 7 || req.body.password.length >= 31 )
		return res.status( 400 ).json( { error: 'invalid password length' } );

	// validate email
	if ( !validEmail( req.body.email ) )
		return res.status( 400 ).json( { error: 'invalid email' } );

	let newUser = new User();

	newUser.firstName = req.body.firstName.toLowerCase();
	newUser.lastName = req.body.lastName.toLowerCase();
	newUser.username = req.body.username.toLowerCase();
	newUser.email = req.body.email.toLowerCase();
	newUser.hash = req.body.password;

	let errorHandler = err => {
		// check duplicate key
		if ( err.code === 11000 ) {
			let error = catchDuplicationKey( err );
			return res.status( 400 ).json( error );
		}
		return next( err );
	}

	// save new user into the database
	newUser.save()
		.then( () => next() )
		.catch( errorHandler );
}

exports.getUserByIdOrUsername = ( req, res, next ) => {

	// filter => ignore super admins
	let filter = {
		$or: [
			{ 'username': req.params.q || req.query.q }
		],
		$and: [{
			$or: [
				{ 'role': ADMIN },
				{ 'role': CLIENT }
			]
		}]
	};

	// push _id property to filter[ '$or' ] array if (q) param is valid id
	if ( validID( req.params.q ) )
		filter[ '$or' ].push( { '_id': req.params.q } );

	let getUser = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );
		return res.status( 200 ).json( user );
	};

	User.findOne( filter, FIELDS ).exec()
		.then( getUser )
		.catch( err => next( err ) );
}

exports.updateUserById = ( req, res, next ) => {

	if ( req.params.id !== req.user.id )
		return res.sendStatus( 401 );

	let updateUser = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );

		// TODO validate params
		user.firstName = req.body.firstName || user.firstName;
		user.lastName = req.body.lastName || user.lastName;
		user.username = req.body.username || user.username;
		user.imgURL = req.body.imgURL || user.imgURL;
		user.hash = req.body.password || user.hash;

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( errorHandler );
	}

	let errorHandler = err => {
		// check duplicate key
		if ( err.code === 11000 ) {
			let error = catchDuplicationKey( err );
			return res.status( 400 ).json( error );
		}
		return next( err );
	}

	// update user
	User.findById( req.params.id ).exec()
		.then( updateUser )
		.catch( err => next( err ) );
}

exports.deleteUserById = ( req, res, next ) => {

	// TODO check if user is a member of a team

	let deleteUser = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );

		if ( user._id !== req.user.id )
			return res.status( 403 ).json( { error: 'invalid user' } );

		return res.sendStatus( 200 );
	}

	User.findByIdAndRemove( req.params.id || req.body.id ).exec()
		.then( deleteUser )
		.catch( err => next( err ) );
}

exports.adminPromotion = ( req, res, next ) => {

	// TODO check if user is a member of a team

	// validate user id
	if ( !req.body.userId || !req.body.userId.length )
		return res.status( 400 ).json( { error: 'missing user id' } );

	let promoteUser = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );

		if ( user.role === ADMIN )
			return res.status( 208 ).json( { error: 'already an admin' } );

		// change the role to 'Admin'
		user.role = ADMIN;

		// send promotion notification
		user.notifications.push({
			sender: req.user.id,
			subject: ADMIN_PROMOTION,
			date: new Date().toString()
		});

		// save changes into database
		user.save()
			.then( () => res.sendStatus( 201 ) )
			.catch( err => next( err ) );
	}

	// promote user
	User.findById( req.body.userId ).exec()
		.then( promoteUser )
		.catch( err => next( err ) );
}

exports.adminDemotion = ( req, res, next ) => {

	// validate user id
	if ( !req.body.userId || !req.body.userId.length )
		return res.status( 400 ).json( { error: 'missing user id' } );

	let demoteUser = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );

		if ( user.role !== ADMIN )
			return res.status( 208 ).json( { error: 'not an admin' } );

		// change the role to 'Admin'
		user.role = CLIENT;

		// send demotion otification
		user.notifications.push({
			sender: req.user.id,
			subject: ADMIN_DEMOTION,
			date: new Date().toString()
		});

		// save changes into database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err ) );
	}

	// demote user
	User.findById( req.body.userId ).exec()
		.then( demoteUser )
		.catch( err => next( err ) );
}

// --------------------------------------------------
// Requests
// --------------------------------------------------
// TODO get sent requests(teams)

exports.getTeamRequests = ( req, res, next ) => {

	// Requests holder
	const Requests = [];

	const getRequests = user => {
		const IDs = { senders: [], teams: [] };
		const dates = [];
		// get all team requests
		user.teamRequests.forEach( request => {
			IDs.senders.push( request.from )
			IDs.teams.push( request.teamId )
			dates.push( request.date )
		});

		const pushRequest =  results => {
			const senders = results[ 0 ];
			const teams = results[ 1 ];

			senders.forEach( ( sender, index ) => {
				const props = {
					sender: `${ sender.firstName } ${ sender.lastName }`,
					senderId: sender._id,
					senderImg: sender.imgURL,
					team: teams[ index ].name,
					teamId: teams[ index ]._id,
					date: dates[ index ]
				};
				Requests.push( props );
			});
			res.status( 200 ).json( Requests );
		}

		const GET_DATA = [
			User.find({ _id: { $in: IDs.senders } }).exec(),	// get senders
			Team.find({ _id: { $in: IDs.teams } }).exec(),		// get teams
		];

		Promise.all( GET_DATA )
			.then( pushRequest )
			.catch( err => next( err ) );
	}

	User.findById( req.user.id ).exec()
		.then( getRequests )
		.catch( err => next( err ) );
}

exports.sendTeamRequest = ( req, res, next ) => {

	// verification params
	if ( !req.body.userId || !req.body.userId.length )
		return res.status( 400 ).json( { error: 'missing user id' } );

	if ( !req.body.teamId || !req.body.teamId.length )
		return res.status( 400 ).json( { error: 'missing team id' } );

	let sendRequest = results => {

		let user = results[ 0 ];
		let team = results[ 1 ];

		if ( !user || !team )
			return res.status( 404 ).json( { error: 'user/team not found' } );

		// reject admins and super admins from joining teams
		if ( user.role === ADMIN || user.role === SUPERADMIN )
			return res.status( 403 ).json( { error: 'not client' } );

		// check if user is already member of the team
		let userIndex = team.members.findIndex(
			member => member.id.toString() === req.body.userId
		);

		if ( userIndex !== -1 )
			return res.status( 403 ).json( { error: 'already member' } );

		// return if the requested team has 5 members
		if ( team.members.length === 5 )
			return res.status( 403 ).json( { error: 'max number of members is 5' } );

		// TODO check how many requests admin has sent for
		// one team, then return if requests === 5

		// check if the requested user has been invited
		let requestIndex = user.teamRequests.findIndex(
			request => request.teamId.toString() === req.body.teamId
		);

		if ( requestIndex !== -1 )
			return res.status( 403 ).json( { error: 'already requested' } );

		// send invitation request
		user.teamRequests.push({
			from: req.user.id,
			teamId: req.body.teamId,
			date: new Date().toString()
		});

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 201 ) )
			.catch( err => next( err ) );
	};

	let GET_DATA = [
		User.findById( req.body.userId ),	// get user
		Team.findById( req.body.teamId )	// get team
	];

	// send team request
	Promise.all( GET_DATA )
		.then( sendRequest )
		.catch( err => next( err ) );
}

exports.declineTeamRequest = ( req, res, next ) => {

	// verification params
	if ( !req.body.userId || !req.body.userId.length )
		return res.status( 400 ).json( { error: 'missing user id' } );

	if ( !req.body.teamId || !req.body.teamId.length )
		return res.status( 400 ).json( { error: 'missing team id' } );

	let declineRequest = user => {
		if ( !user )
			return res.status( 404 ).json( { error: 'user not found' } );

		// authorize requester
		// only the admin and the requested user can cancel the request
		if ( req.user.id !== user._id.toString() && req.body.userId !== user._id.toString() )
			return res.sendStatus( 403 );

		// get request index
		let requestIndex = user.teamRequests.findIndex(
			request => request.teamId.toString() === req.body.teamId
		);

		// return if request not found or deleted
		if ( requestIndex === -1 )
			return res.status( 404 ).json( { error: 'request not found' } );

		// remove the request from user's requests
		user.teamRequests.splice( requestIndex, 1 );

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err) );
	}

	// decline or cancel request
	User.findById( req.body.userId ).exec()
		.then( declineRequest )
		.catch( err => next( err ) );
}

// --------------------------------------------------
// Notification
// --------------------------------------------------
exports.getAllNotifications = ( req, res, next ) => {

	// TODO get all notification informations

	/*
	props = {
		subject,
		senderName,
		senderId,
		date,
		seen,
		read
	}
	*/

	User.findById( req.user.id ).exec()
		.then( user => res.status( 200 ).json( user.notifications ) )
		.catch( err => next( err ) );
}

exports.updateAllNotifications = ( req, res, next ) => {

	let updateNotifications = user => {
		user.notifications.forEach( notification => {
			// change notifications props
			if ( req.body.markSeen && req.body.markSeen === true )
				notification.seen = true;

			if ( req.body.markRead && req.body.markRead === true )
				notification.read = true;
		});

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err ) );
	}

	// update notifications
	User.findById( req.user.id ).exec()
		.then( updateNotifications )
		.catch( err => next( err ) );
}

exports.updateOneNotification = ( req, res, next ) => {

	let updateNotification = user => {
		// get notification index
		let notificationIndex = user.notifications.findIndex(
			notification => notification._id.toString() === req.params.id
		);

		if ( notificationIndex === -1 )
			return res.status( 404 ).json( { error: 'notification not found' } );

		// change notification props
		if ( req.body.markRead && req.body.markRead === true )
			user.notifications[ notificationIndex ].read = true;

		if ( req.body.markSeen  && req.body.markSeen === true )
			user.notifications[ notificationIndex ].seen = true;

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err ) );
	}

	// update notification
	User.findById( req.user.id ).exec()
		.then( updateNotification )
		.catch( err => next( err ) );
}

exports.deleteAllNotifications = ( req, res, next ) => {

	let deleteNotifications = user => {
		// override the user's notifications array
		user.notifications = [];

		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err ) );
	}

	// delete all notifications
	User.findById( req.user.id ).exec()
		.then( deleteNotifications )
		.catch( err => next( err ) );
}

exports.deleteOneNotification = ( req, res, next ) => {

	let deleteNotification = user => {
		// get notification index
		let notificationIndex = user.notifications.findIndex(
			notification => notification._id.toString() === req.params.id
		);

		if ( notificationIndex === -1 )
			return res.status( 404 ).json( { error: 'notification not found' } );

		// remove notification from notifications array
		user.notifications.splice( notificationIndex, 1 );

		// save changes into the database
		user.save()
			.then( () => res.sendStatus( 200 ) )
			.catch( err => next( err ) );
	}

	// delete one notification
	User.findById( req.user.id ).exec()
		.then( deleteNotification )
		.catch( err => next( err ) );
}
