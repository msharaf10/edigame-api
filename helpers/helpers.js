exports.regex = {
    validEmail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    hasSpace: /^[a-zA-Z0-9-_]+$/
}

exports.validPhone = ( phone ) => {
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
