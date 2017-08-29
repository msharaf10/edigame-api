const express = require( 'express' );

const app = express();

app.get( '/' , ( req, res, next ) => {
	res.send( 'test, edigame' );
});

let server = app.listen( 3000 ),
	port = server.address().port,
	mode = app.get( 'env' );

console.log( 'Listening at http://localhost:%s in %s', port, mode );
