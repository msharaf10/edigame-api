const mongoose = require( 'mongoose' );

exports.validEmail = email => {
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return ( regex ).test( email )
}

exports.hasSpace = string => {
    let regex = /^[a-zA-Z0-9-_]+$/;
    return !( regex ).test( string );
}

exports.isValidPhone = phone => {
    let userPhone = '',
        i;

    for ( i = 0; i < phone.length; i++ ) {

        if ( !isNaN( phone[ i ] ) )
            userPhone += phone[ i ];
    }

    if ( userPhone.length !== 11 )
        return false;

    return true;
}

exports.validID = id => {
    return mongoose.Types.ObjectId.isValid( id );
}

exports.delay = ms => {
    return new Promise( resolve => setTimeout( resolve, ms ) )
};

exports.catchDuplicationKey = err => {
    let field = err.message.split( 'index: ' )[ 1 ];
    field = field.split( ' dup key' )[ 0 ];

    let dupKey = field.substring( 0, field.lastIndexOf( '_' ) );

    // for users
    if ( dupKey === 'email' )
        return { error: `${ dupKey } already registered` };

    if ( dupKey === 'username' )
        return { error: `${ dupKey } already registered` };

    // for teams
    if ( dupKey === 'name' )
        return { error: 'team name already token' };

    return { error: 'something went wrong, please try again!' };
}
