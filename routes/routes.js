const express = require( 'express' );

const app = express();
const router = express.Router();

// Routes
router.route( '/' )
	.get( ( req, res, next ) => {
		res.send( 'test routes' );
	});

module.exports = router;
