
exports.validEmail = email => {
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return ( regex ).test( email )
}

exports.validName = string => {
    let regex = /^[a-zA-Z0-9_]{6,15}$/
    return ( regex ).test( string )
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
    let regex = /^[a-fA-F0-9]{24}$/;
    return ( regex ).test( id );
}

exports.catchDuplicationKey = err => {
    let field = err.message.split( 'index: ' )[ 1 ];
    field = field.split( ' dup key' )[ 0 ];

    let dupKey = field.substring( 0, field.lastIndexOf( '_' ) );

    // for users
    if ( dupKey === 'email' || dupKey === 'username' )
        return { error: `${ dupKey } already registered` };

    // for teams
    if ( dupKey === 'name' )
        return { error: 'team name already token' };

    return { error: 'something went wrong, please try again!' };
}
