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

        user.comparePassword( req.body.password, ( err, isMatch ) => {
            if ( err ) return next( err );
            if ( !isMatch ) return res.status( 401 ).send( 'Incorrect password' );

            let payload = {
                id: user._id,
                name: user.firstName || user.username,
                username: user.username,
                email: user.email,
                team: user.team,
                started: user.started,
                profPic: user.profPic,
                isAdmin: !!user.isAdmin,
                isLeader: !!user.isLeader
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

exports.adminRequired = ( req, res, next ) => {
    var token = req.headers[ 'x-access-token' ];

    try {
        var decoded = jwt.decode( token, config.secretKey, true );
    } catch ( err ) {
        return res.status( 403 ).send( 'Failed to authenticate token' );
    }
    if ( decoded.isAdmin ) {
        next();
        //res.send( decoded.isAdmin );
    } else {
        res.status( 403 ).send( 'Not allowed, Admin Required' );
    }
}

exports.leaderRequired = ( req, res, next ) => {
    var token = req.headers[ 'x-access-token' ];

    try {
        var decoded = jwt.decode( token, config.secretKey, true );
    } catch ( err ) {
        return res.status( 403 ).send( 'Failed to authenticate token' );
    }
    if ( decoded.isLeader ) {
        //next();
        res.send( decoded.isLeader );
    } else {
        res.status( 403 ).send( 'Not allowed, Leader Required' );
    }
}

exports.tokenRequired = ( req, res, next ) => {
    let token = req.headers[ 'x-access-token' ];
    if ( !token ) return res.status( 403 ).send( 'Token required' );

    try {
        var decoded = jwt.decode( token, config.secretKey, true );
    } catch ( err ) {
        return res.status( 403 ).send( 'Failed to authenticate token' );
    }
    next();
}
