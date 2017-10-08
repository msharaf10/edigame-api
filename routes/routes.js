const express = require( 'express' );

const users = require( '../controllers/users' );
const teams = require( '../controllers/teams' );
const auth = require( '../controllers/auth' );
const rooms = require( '../controllers/rooms' );

const app = express();
const router = express.Router();

// TODO params ( id, userName,  ) middleware

// =====================================
// Routes
// =====================================

// ======================
// users
// ======================
router.route( '/users' )
	.get( users.getUsers )
	.post( users.createUser, auth.loginUser );

router.route( '/users/:id')
	.get( users.getUserById )
	.put( users.updateUserById )
	.delete( users.deleteUserById );

router.route( '/users/user/:username' )
	.get( users.getUserByUsername );

// ======================
// Teams
// ======================
router.route( '/teams' )
	.get( teams.getTeams )
	.post( auth.adminRequired, teams.createTeam );

router.route( '/teams/:id' )
	.get( teams.getTeamById )
	.put( auth.adminRequired, teams.updateTeamById )
	.delete( auth.adminRequired, teams.deleteTeamById );

router.route( '/teams/team/:name' )
	.get( teams.getTeamByName );

router.route( '/teams/:id/ready' )
	.get( teams.getReadyUsers );

router.route( '/teams/:name/users' )
	.get( users.getTeam, users.getUsersOfTeam );

router.route( '/teams/add/user' )
	.post( auth.adminRequired, teams.addUserToTeam );

router.route( '/teams/remove/user' )
	.post( auth.adminRequired, teams.removeUserFromTeam );

// ======================
// Search
// ======================
router.get( '/search/user', users.getUserByUsername );
router.get( '/search/team', teams.getTeamByName );

// ======================
// rooms
// ======================
router.route( '/room/teams/:id/ready/toggle' )
	.put( teams.toggleReadyUser );

/*router.route( '/room/ready/:id' )
	.get( rooms. )
	.put( auth.leaderRequired, rooms.updateTeam )
	.delete( auth.leaderRequired, rooms.deleteRoomById );*/


router.post( '/auth/token' ,  auth.loginUser  );

module.exports = router;
