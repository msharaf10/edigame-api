/*
*
*  ->  FILENAME :    createFirstSuperAdmin.js
*
*  ->  RESPONSIBILITY :
*           Create first super admin.
*
*  ->  DESCRIPTION :
*           Create first super admin from credentials.js file if there is no one,
*           and print it out to the console for whomever run the application.
*
*  ->  LAST MODIFIED BY :
*           Mohamed Sharaf
*
*/

const mongoose = require( 'mongoose' );

const User = require( '../models/schemas/user' );

const { db } = require( '../config/main' );
const credentials = require( '../config/credentials' );
const { SUPERADMIN } = require( '../config/constants' ).userRoles;

// set disconnect flag
let disconnect = false;

// open a mongoose connection if it doesn't exist
if ( mongoose.connection.readyState === 0 ) {

    console.log( 'opening mongoose connection...' );

    mongoose.Promise = global.Promise;

    mongoose.connect( `mongodb://${ db.dbURL }`, {
    	useMongoClient: true,
    	keepAlive: 300000
    }).catch( err => console.error( err.message ) );

    // close connection if running as standalone script
    disconnect = true;
}

let createFirstSuperAdmin = admin => {
    if ( admin ) {
        console.log( `'${ credentials.superAdminEmail }' found` );
        if ( disconnect ) {
            console.log( 'closing mongoose connection...' );
            mongoose.connection.close();
        }
        return;

    } else {
        console.log( `${ credentials.superAdminEmail } account not detected` );

        let newSuperAdmin = new User({
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            username: credentials.username,
            imgURL: credentials.superAdminImg,
            email: credentials.superAdminEmail,
            hash: credentials.superAdminPassword,
            role: SUPERADMIN,
            isVerified: true
        });

        newSuperAdmin.save()
            .then( () => {
                console.log( 'Successfully created first super admin' );
                console.log( 'Email:', credentials.superAdminEmail );
                console.log( 'Password:', credentials.superAdminPassword );

                if ( disconnect ) {
                    console.log( 'closing mongoose connection...' );
                    mongoose.connection.close();
                }
            })
            .catch( err => console.error( err ) );
    }
}

let errorHandler = err => {
    if ( disconnect ) {
        console.log( 'closing mongoose connection...' );
        mongoose.connection.close();
        return;
    }
    console.error( err );
}

// create first super admin
User.findOne( { email: credentials.superAdminEmail } ).exec()
    .then( createFirstSuperAdmin )
    .catch( errorHandler );
