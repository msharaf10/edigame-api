const express = require( 'express' );
const logger = require( 'morgan' );
const bodyParser = require( 'body-parser' );
const mongoose = require( 'mongoose' );

const config = require( './models/config' );
const routes = require( './routes/routes' );

const app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

mongoose.Promise = global.Promise;
mongoose.connect( config.dbURL, { server: { socketOptions: { keepAlive: 120 } } } );

if ( app.get( 'env' ) !== 'production' ) app.use( logger( 'dev' ) );

app.use( '/', routes );

// =====================================
// Error Handler
// =====================================
app.use( ( req, res, next ) => {
	let err = new Error( 'NOT FOUND' );
	err.status =  404;
	next( err );
});

app.use( ( err, req, res, next ) => {
	if ( app.get( 'env' ) === 'development' ) console.log( err.message );

	let status = err.status || 500;
	let message;
	
	if ( status >= 400 && status < 500 && err.message ) {
		message = err.message;
	} else {
		message = '';
	
	}
	res.status( status ).send( message );
});

let server = app.listen( config.port ),
	port = server.address().port,
	mode = app.get( 'env' );

console.log( 'Listening at http://localhost:%s in %s', port, mode );
