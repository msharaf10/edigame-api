const jwt = require( 'jwt-simple' );

const User = require( '../models/schemas/user' );
const config = require( '../models/config' );
const helpers = require( '../models/helpers' );

exports.loginUser = ( req, res, next ) => {

    // check required params
    let requiredParams = [
        'email',
        'password'
    ],
        errorParam = false;

    requiredParams.forEach( ( param ) => {
        if ( errorParam ) return;

        if ( param === 'email' && ( typeof req.body.email !== 'string' || !req.body.email.length ) )
            errorParam = 'Missing ' + param;

        if ( param === 'password' && ( typeof req.body.password !== 'string' || !req.body.password.length ) )
            errorParam = 'Missing ' + param;
    });

    if ( errorParam )
        return res.status( 400 ).send( errorParam );

    // validate email
    if ( !( helpers.regex.validEmail ).test( req.body.email ) )
        return res.status( 400 ).send( 'Invalid email' );

    // validate password
    if ( req.body.password.length <= 7 )
        return res.status( 400 ).send( 'Invalid password' );

    User.findOne( { email: req.body.email } ).exec()
    .then( ( user ) => {
        if ( !user ) return res.status( 404 ).send( 'No user with that email' );

        user.comparePassword( req.body.password, ( err, isMatch ) => {
            if ( err ) return next( err );
            if ( !isMatch ) return res.status( 401 ).send( 'Incorrect password' );

            let payload = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                profPic: user.profPic,
                isAdmin: !!user.isAdmin
            };

            let token = jwt.encode( payload, config.secretKey );

            user.token = token;

            user.save().then( () => {
                res.json( { token: token } );
            }).catch( ( err ) => next( err ) )
        });
    }).catch( ( err ) => next( err ) );
}

exports.adminRequired = ( req, res, next ) => {
    var token = req.headers[ 'x-access-token' ];

    try {
        var decoded = jwt.decode( token, config.secretKey, true );
    } catch ( err ) {
        return res.status( 403 ).send( 'Failed to authenticate token' );
    }
    if ( decoded.isAdmin ) {
        next();
    } else {
        res.status( 403 ).send( 'Not allowed, Admin Required' );
    }
}

exports.leaderRequired = ( req, res, next ) => {
    // TODO check if user is a leader of his team
}
