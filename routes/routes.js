const express = require( 'express' );

const users = require( '../controllers/users' );
const teams = require( '../controllers/teams' );
const runs = require( '../controllers/runs' );
const search = require( '../controllers/search' );
const auth = require( '../controllers/auth' );

const { validID } = require( '../helpers/helpers' );
const { validateIDs } = require( '../routes/middlewares' );

const router = express.Router();

// =====================================
// Middleware
// =====================================
router.use( validateIDs );

router.param( 'id', ( req, res, next ) => {
	if ( !validID( req.params.id ) )
		return res.status( 400 ).json( { error: 'invalid id' } );
	next();
});

// =====================================
// Routes
// =====================================

// ======================
// users
// ======================
router.route( '/user/getData' )
	.get( auth.tokenRequired, users.getUserData );

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

router.route( '/requests/teams/sent' )
	.get( auth.adminRequired, users.getSentTeamRequests );

router.route( '/notifications' )
	.get( auth.tokenRequired, users.getAllNotifications )
	.put( auth.tokenRequired, users.updateAllNotifications )
	.delete( auth.tokenRequired, users.deleteAllNotifications );

router.route( '/notifications/:id' )
	.put( auth.tokenRequired, users.updateOneNotification )
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

router.route( '/teams/members/add' )
	.post( auth.tokenRequired, teams.addMemberToTeam );

router.route( '/teams/members/destroy' )
	.delete( auth.adminRequired, teams.removeMemberFromTeam );

router.route( '/teams/members/leader' )
	.post( auth.adminRequired, teams.makeLeader );

router.route( '/teams/ready' )
	.post( auth.adminRequired, teams.changeReadyStateOfTeam );

// ======================
// Search
// ======================
router.post( '/search/any', auth.tokenRequired, search.searchAny );
router.post( '/search/users', search.searchUsers );
router.post( '/search/teams', auth.adminRequired, search.searchTeams );

// ======================
// Match/Run
// ======================
router.route( '/runs/teams/members/ready' )
	.get( auth.tokenRequired, runs.getReadyMembers )
	.post( auth.tokenRequired, runs.toggleReadyState );

router.route( '/runs/teams/members/role' )
	.post( auth.tokenRequired, runs.changeMemberRole );

router.route( '/runs/teams/start' )
	.post( auth.tokenRequired, runs.startRun );

// ======================
// Authentication
// ======================
router.post( '/auth/token' ,  auth.loginUser  );
router.post( '/auth/reset-password', auth.resetPassword );
router.post( '/auth/forgot-password', auth.forgotPassword );

module.exports = router;
