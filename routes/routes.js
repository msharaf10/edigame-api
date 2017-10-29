const express = require( 'express' );

const users = require( '../controllers/users' );
const teams = require( '../controllers/teams' );
const search = require( '../controllers/search' );
const auth = require( '../controllers/auth' );

const router = express.Router();

const { validID } = require( '../helpers/helpers' );

// =====================================
// Middleware
// =====================================
router.param( 'id', ( req, res, next ) => {
	if ( !validID( req.params.id ) )
		return res.status( 400 ).json( { error: 'invalid ID' } );
	next();
});

// validate mongoose objects ID
exports.validateIDs = ( req, res, next ) => {

	if ( req.body.userId && !validID( req.body.userId ) )
		return res.status( 400 ).json( { error: 'invalid ID' } );

	if ( req.body.teamId && !validID( req.body.teamId ) )
		return res.status( 400 ).json( { error: 'invalid ID' } );

	if ( req.body.adminId && !validID( req.body.adminId ) )
		return res.status( 400 ).json( { error: 'invalid ID' } );

	next();
}

// =====================================
// Routes
// =====================================

// ======================
// users
// ======================
router.route( '/users' )
	.get( users.getUsers )
	.post( users.createUser, auth.loginUser );

router.route( '/users/:q' )
	.get( users.getUserByIdOrUsername );

router.route( '/users/:id')
	.put( auth.tokenRequired,  users.updateUserById )
	.delete( auth.tokenRequired, users.deleteUserById );

router.route( '/requests/teams' )
	.get( auth.tokenRequired, users.getTeamRequests );

router.route( '/requests/teams/send' )
	.post( auth.adminRequired, users.sendTeamRequest );

router.route( '/requests/teams/destroy' )
	.delete( auth.tokenRequired, users.declineTeamRequest );

router.route( '/notifications' )
	.get( auth.tokenRequired, users.getAllNotifications )
	.put( auth.tokenRequired, users.markAllNotificationsAsSeenOrRead )
	.delete( auth.tokenRequired, users.deleteAllNotifications );

router.route( '/notifications/:id' )
	.put( auth.tokenRequired, users.markOneNotificationAsSeenOrRead )
	.delete( auth.tokenRequired, users.deleteOneNotification );

router.route( '/admins' )
	.post( auth.superAdminRequired, users.adminPromotion )
	.delete( auth.superAdminRequired, users.adminDemotion );

// ======================
// Teams
// ======================
router.route( '/teams' )
	.get( auth.adminRequired, teams.getTeams )
	.post( auth.adminRequired, teams.createTeam );

router.route( '/teams/:q' )
	.get( auth.tokenRequired, teams.getTeamByIdOrName );

router.route( '/teams/:id' )
	.put( auth.adminRequired, teams.updateTeamById )
	.delete( auth.adminRequired, teams.deleteTeamById );

router.route( '/teams/users/:id' )
	.get( auth.tokenRequired, teams.getTeamsOfUserOrAdmin );

router.route( '/teams/:id/ready' )
	.get( auth.tokenRequired, teams.getReadyMembers )
	.post( auth.tokenRequired, teams.toggleReadyState );

router.route( '/teams/members/add' )
	.post( auth.tokenRequired, teams.addMemberToTeam );

router.route( '/teams/members/destroy' )
	.delete( auth.adminRequired, teams.removeMemberFromTeam );

// ======================
// Search
// ======================
router.post( '/search/any', auth.tokenRequired, search.searchAny );
router.post( '/search/users', search.searchUsers );
router.post( '/search/teams', auth.adminRequired, search.searchTeams );

// ======================
// Match/Run
// ======================
// match routes here

// ======================
// Authentication
// ======================
router.post( '/auth/token' ,  auth.loginUser  );
router.post( '/auth/reset-password', auth.resetPassword );
router.post( '/auth/forgot-password', auth.forgotPassword );

exports.routes = router;
