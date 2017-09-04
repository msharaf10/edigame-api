const Team = require( '../models/schemas/team' );
const User = require( '../models/schemas/user' );

exports.getTeams = ( req, res, next ) => {
    Team.find( {}, ( err, teams ) => {
        if ( err ) return next( err );
        return res.json( teams );
    });
}

exports.createTeam = ( req, res, next ) => {
    // TODO admin required
    // TODO validating team
    let newTeam = new Team( req.body );
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

// TODO get team by name

exports.getTeamByName = ( req, res, next ) => {
    Team.find( { 'teamName': req.params.name || req.body.teamName }, {},( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that name' );
        return res.status( 200 ).send( team );
    });
}

// TODO search for team Algorithm

exports.updateTeamById = ( req, res, next ) => {
    Team.findByIdAndUpdate( req.params.id, req.body, ( err, team ) => {
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

exports.getReadyUsers = ( req, res, next ) => {
    Team.findById( req.body.teamId || req.params.id, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'This team is NOT exist!' );
        let readyPlayers = team.players.filter( ( player ) => {
            if ( player.isReady )
                return player;
        });
        if ( readyPlayers.length )
            return res.send( readyPlayers );
        return res.send( 'Non of the players is ready' );
    });
}

// TODO define route for users of team
exports.getUsersOfTeam = ( req, res, next ) => {
    Team.findById( req.body.teamId, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
        return res.status( 200 ).send( team.players );
    });
}

exports.toggleReadyUser = ( req, res, next ) => {
    if ( !req.body.playerId )
        return res.status( 400 ).send( 'Missing player ID' );

	Team.findById( req.params.id || req.body.userTeam, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );

        for ( var i in team.players ) {
            if ( team.players[ i ].playerId.toString() === req.body.playerId.toString() ) {
                console.log( 'about to toggle' )
                team.players[ i ].isReady = !team.players[ i ].isReady;
                console.log( 'player\'s isReady is toggled' );
                var status = team.players[ i ].isReady;
                break;
            }
        }
        team.markModified( 'players' );
        team.save( ( err ) => {
            if ( err ) return next( err );
            console.log( 'player: ' + req.body.playerId + ' updated to: ' + status );
            return res.sendStatus( 200 );
        });
    });
}
