const Team = require( '../models/schema/team' );

exports.getTeams = ( req, res, next ) => {
    Team.find( {}, ( err, teams ) => {
        if ( err ) return next( err );
        return res.json( teams );
    });
}

exports.createTeam = ( req, res, next ) => {
    // TODO admin required
    // TODO validating team
    var newTeam = new Team( req.body );
    newTeam.save( ( err ) => {
        if ( err ) {
            if ( err.code === 11000 ) return res.status( 400 ).send( 'This team is already token' );
            return next( err );
        }
        return res.sendStatus( 200 );
    });
}

exports.getTeamById = ( req, res, next ) => {
    Team.findById( req.params.id , ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
        return res.status( 200 ).send( team );
    });
}

exports.updateTeamById = ( req, res, next ) => {
    Team.findByIdAndUpdate( req.params.id, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
        return res.sendStatus( 200 );
    });
}

exports.deleteTeamById = ( req, res, next ) => {
    Team.findByIdAndRemove( req.params.id, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
        return res.sendStatus( 200 );
    });
}
