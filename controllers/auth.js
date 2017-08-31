const jwt = require( 'jwt-simple' );

const User = require( '../models/schemas/user' );
const config = require( '../models/config' );

exports.loginUser = ( req, res, next ) => {
    if ( typeof req.body.email !== 'string' )
        return res.status( 400 ).send( 'Missing email' );
    if ( typeof req.body.password !== 'string' )
        return res.status( 400 ).send( 'Missing password' );

    User.findOne( { email: req.body.email }, ( err, user ) => {
        if ( err ) return next( err );
        if ( !user ) return res.status( 404 ).send( 'No user with that email' );

        user.comparePassword( req.body.password, ( err, isMatch) => {
            if ( err ) return next( err );
            if ( !isMatch ) return res.status( 401 ).send( 'Incorrect password' );

            let payload = {
                id: user._id,
                name: user.firstName || user.lastName || user.email,
                fullName: user.lastName ? user.firstName + ' ' + user.lastName : user.firstName,
                email: user.email,
                isAdmin: !!user.isAdmin
            };

            let token = jwt.encode( payload, config.secretKey );

            user.token = token;

            user.save( ( err ) => {
                if ( err ) return next( err );
                res.json( { token: token } );
            });
        });
    });
}
