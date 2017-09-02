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

exports.toggleReadyUser = ( req, res, next ) => {
    Team.update( req.body.teamId || req.params.id, ( err, team ) => {
        if ( err ) return next( err );
        if ( !team ) return res.status( 404 ).send( 'This team is not exist' );

        let players = team.players;
        console.log( 'one players: ' + players[0].isReady );

        function findUserId( userId ) {
            return userId.playerId === req.body.playerId;
        }

        let player = players.find( findUserId );
        console.log( 'player: ' + player );
        // TODO check if user is ready

        player.isReady = !player.isReady;
        team.markModified('players');
        team.save( ( err ) => {
            if ( err ) return next( err );
            return res.sendStatus( 200 );
        });
    });
}
