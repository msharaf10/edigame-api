/*
*
*  ->  FILENAME :    auth.js
*
*  ->  RESPONSIBILITY :
*           Authentication and authorization users.
*
*  ->  DESCRIPTION :
*           Identifying users and access control to system objects
*           based on their identity.
*
*  ->  LAST MODIFIED BY :
*           Mohamed Sharaf
*
*/

const jwt = require( 'jsonwebtoken' );
const User = require( '../models/schemas/user' );

const constants = require( '../config/constants' );
const { secretKey } = require( '../config/credentials' );
const { validEmail, validID } = require( '../helpers/helpers' );
const { ADMIN, SUPERADMIN } = constants.userRoles;

exports.loginUser = ( req, res, next ) => {
    // check required params
    const requiredParams = [
        'email',
        'password'
    ],
        missingParam = false;

    requiredParams.forEach( param => {
        if ( missingParam ) return;

        if ( !req.body[ param ] || typeof req.body[ param ] !== 'string' || !req.body[ param ].length )
            missingParam = `missing ${ param }`;
    });

    if ( missingParam )
        return res.status( 400 ).json({ error: missingParam });

    // validate email
    if ( !validEmail( req.body.email ) )
        return res.status( 400 ).json({ error: 'invalid email' });

    const sendToken = user => {
        if ( !user )
            return res.status( 404 ).json({ error: 'no user with that email' });

        // compare passwords
        user.comparePassword( req.body.password, ( err, isMatch ) => {
            if ( err ) return next( err );

            if ( !isMatch )
                return res.status( 401 ).json({ error: 'incorrect password' });

            const payload = { id: user._id };

            const token = jwt.sign( payload, secretKey );

            user.token = token;

            user.save()
                .then( res.json({ token: token }) )
                .catch( err => next( err ) );
        });
    }

    User.findOne({ email: req.body.email }).exec()
        .then( sendToken )
        .catch( err => next( err ) );
}

exports.resetPassword = ( req, res, next ) => {
    // TODO reset password
}

exports.forgotPassword = ( req, res, next ) => {
    // TODO forgot password
}

exports.tokenRequired = ( req, res, next ) => {
    validateToken( req, res, next );
}

exports.adminRequired = ( req, res, next ) => {
    validateToken( req, res, next, true );
}

exports.superAdminRequired = ( req, res, next ) => {
    validateToken( req, res, next, false, true );
}

const validateToken = ( req, res, next, admin, superAdmin ) => {
    const token = req.headers[ 'x-access-token' ] || req.body.token;

    if ( !token )
        return res.status( 403 ).json({ error: 'token required' });

    let decoded;

    // try verify user's token
    try {
        decoded = jwt.verify( token, secretKey );
    } catch ( e ) {
        return res.status( 403 ).json({ error: 'failed to authenticate token' });
    }

    if ( !decoded.id || !validID( decoded.id ) )
        return res.status( 403 ).json({ error: 'invalid token' });

    const checkUserIdentity = user => {
        if ( !user )
            return res.status( 403 ).json({ error: 'invalid user ID' });

        if ( token !== user.token )
            return res.status( 403 ).json({ error: 'expired token' });

        if ( admin && user.role !== ADMIN )
            return res.status( 403 ).json({ error: 'admin required' });

        if ( superAdmin && user.role !== SUPERADMIN )
            return res.status( 403 ).json({ error: 'super admin required' });

        req.user = {
            id: decoded.id,
            role: user.role
        };
        next();
    }

    User.findById( decoded.id ).exec()
        .then( checkUserIdentity )
        .catch( err => next( err ) );
}
