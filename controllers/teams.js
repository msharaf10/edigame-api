const Team = require( '../models/schemas/team' );
const User = require( '../models/schemas/user' );

exports.getTeams = ( req, res, next ) => {
    Team.find( {} ).exec()
    .then( ( teams ) => res.status( 200 ).json( teams ) )
    .catch( ( err ) => next( err ) );
}

exports.createTeam = ( req, res, next ) => {
    let requiredParams = [ 'teamName', 'companyName', 'ID' ],
        errorParam = false;

    requiredParams.forEach( ( param ) => {
        if ( errorParam ) return;

        if ( param === 'teamName' && ( typeof req.body.teamName !== 'string' || !req.body.teamName.length ) ) {
            errorParam = 'Missing requierd ' + param;
        }

        if ( param === 'companyName' && ( typeof req.body.companyName !== 'string' || !req.body.companyName.length ) ) {
            errorParam = 'Missing requierd ' + param;
        }

        if ( param === 'ID' && ( typeof req.body.adminId !== 'string' || !req.body.adminId.length ) ) {
            errorParam = 'Missing requierd ' + param;
        }
    });

    if ( errorParam ) return res.status( 400 ).send( errorParam );

    let newTeam = new Team();

    newTeam.teamName = req.body.teamName;
    newTeam.companyName = req.body.companyName;
    newTeam.admin = req.body.adminId;

    newTeam.save().then( ( team ) => {
        res.sendStatus( 201 );
    }).catch( ( err ) => {
        if ( err.code === 11000 ) return res.status( 400 ).send( 'This team is already token' );
        next( err );
    });
}

exports.getTeamById = ( req, res, next ) => {
    Team.findById( req.params.id ).exec()
    .then( ( team ) => {
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
        res.status( 200 ).send( team );
    }).catch( ( err ) => next( err ) );
}

// TODO get team by name

exports.getTeamByName = ( req, res, next ) => {
    Team.findOne( { 'teamName' : req.query.q || req.params.name || req.body.teamName }, {} ).exec()
    .then( ( team ) => {
        if ( !team ) return res.status( 404 ).send( 'No team with that name' );
        res.status( 200 ).send( team );
    }).catch( ( err ) => next( err ) );
}

// TODO search for team Algorithm

exports.updateTeamById = ( req, res, next ) => {
    Team.findByIdAndUpdate( req.params.id, req.body ).exec()
    .then( ( team ) => {
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );
    }).then( () => {
        res.sendStatus( 200 );
    }).catch( ( err ) => next( err ) );
}

exports.deleteTeamById = ( req, res, next ) => {
    Team.findByIdAndRemove( req.params.id ).exec()
    .then( ( team ) => {
        if ( !team ) {
            var err = new Error( 'No team with that ID' );
            err.status = 400;
            throw err;
        }
    }).then( () => {
        return res.sendStatus( 200 );
    }).catch( ( err ) => next( err ) );
}

exports.getReadyUsers = ( req, res, next ) => {
    Team.findById( req.body.teamId || req.params.id ).exec()
    .then( ( team ) => {
        if ( !team ) return res.status( 404 ).send( 'This team is NOT exist!' );

        let readyPlayers = team.players.filter( ( player ) => {
            if ( player.isReady )
                return player;
        });

        if ( readyPlayers.length )
            return res.status( 200 ).send( readyPlayers );
    }).catch( ( err ) => next( err ) );
}

exports.toggleReadyUser = ( req, res, next ) => {
    if ( !req.body.playerId )
        return res.status( 400 ).send( 'Missing player ID' );

	Team.findById( req.params.id || req.body.userTeam ).exec()
    .then( ( team ) => {
        if ( !team ) return res.status( 404 ).send( 'No team with that ID' );

        // TODO check if user is member of the team
        for ( var i in team.players ) {
            if ( team.players[ i ].playerId.toString() === req.body.playerId.toString() ) {
                console.log( 'about to toggle' )
                team.players[ i ].isReady = !team.players[ i ].isReady;
                var status = team.players[ i ].isReady;
                console.log( 'isReady was toggled to: ' + status );
                break;
            }
        }

        team.save().then( ( user ) => {
            console.log( 'player: ' + req.body.playerId + ' updated to: ' + status );
        }).catch( ( err ) => next( err ) );

    }).then( () => {
        res.sendStatus( 200 );
    }).catch( ( err ) => next( err ) );
}

exports.addUserToTeam = ( req, res, next ) => {
    if ( !req.body.playerId ) return res.status( 400 ).send( 'no player ID' );

    Team.findById( req.body.teamId ).exec()

    .then( ( team ) => {

        if ( !team )
            return res.status( 404 ).send( 'No team with that ID' );
        if ( team.players.length === 5 ) {
            var err = new Error( 'Max number of players is 5' );
            err.status = 400;
            throw err;
        }

        // check if player is already member of the team
        for ( var i in team.players ) {
            if ( team.players[ i ].playerId == req.body.playerId ) {
                var err = new Error( 'This player already member of your team' );
                err.status = 400;
                throw err;
            }
        }

        // add player to the team
        team.players.push({
            playerId: req.body.playerId
        });

        team.save().then( () => {
            console.log( 'The user have new team, now' );
        }).catch( ( err ) => next( err ) );

    }).then( () => {
        return res.sendStatus( 201 );
    }).catch( ( err ) => next( err ) );
}

exports.removeUserFromTeam = ( req, res, next ) => {
    if ( !req.body.playerId ) return res.status( 400 ).send( 'no player ID' );

    Team.findById( req.body.teamId ).exec()

    .then( ( team ) => {

        let userIndex = team.players.findIndex( player => player.playerId == req.body.playerId );
        if ( userIndex === -1 ) {
            var err = new Error( 'No players with that ID' );
            err.status = 400;
            throw err;
        }

        team.players.splice( userIndex, 1 );
        team.save().then( () => {
            console.log( 'The user has removed from team' );
        }).catch( ( err ) => next( err ) );

    }).then( () => {
        return res.sendStatus( 200 );
    }).catch( ( err ) => next( err ) );
}
