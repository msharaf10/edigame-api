const express = require( 'express' );

const users = require( '../controllers/users' );

const app = express();
const router = express.Router();

// Routes
router.route( '/' )
	.get( ( req, res, next ) => {
		res.send( 'test routes' );
	});

router.route( '/users' )
	.get( users.getUsers )
	.post( users.createUser );

router.route( '/users/:id')
	.get( users.getUserById )
	.put( users.updateUserById )
	.delete( users.deleteUserById );

module.exports = router;
