const Team = require( '../models/schemas/team' );
const User = require( '../models/schemas/user' );

const constants = require( '../config/constants' );

const { FIELDS } = constants;
const { ACCEPT_REQUEST } = constants.subjects;
const { SUPERADMIN, ADMIN, CLIENT } = constants.userRoles;
const { validName, validEmail, validID, catchDuplicationKey } = require( '../helpers/helpers' );

exports.getTeams = ( req, res, next ) => {
    let fields = '_id name company members.id';

    Team.find( {}, fields ).exec()
        .then( teams => res.status( 200 ).json( teams ) )
        .catch( err => next( err ) );
}

// TODO create new chat to the new team
exports.createTeam = ( req, res, next ) => {

    let requiredParams = [ 'teamName', 'company' ],
        missingParam = false;

    requiredParams.forEach( param => {
        if ( missingParam ) return;

        if ( !req.body[ param ] || typeof req.body[ param ] !== 'string' || !req.body[ param ].length )
            missingParam = `missing ${ param }`;
    });

    if ( missingParam )
        return res.status( 400 ).json( { error: missingParam } );

    // validate team name
    if ( !validName( req.body.teamName ) )
        return res.status( 400 ).json( { error: 'invalid team name' } );

    // prevent clients and super admins from creating teams
    if ( req.user.role !== ADMIN )
        return res.status( 403 ).json( { error: 'admins only can create teams' } );

    let newTeam = new Team();

    newTeam.name = req.body.teamName;
    newTeam.company = req.body.company;
    newTeam.author = req.user.id;

    let errorHandler = err => {
        // check duplicate key
        if ( err.code === 11000 ) {
            let error = catchDuplicationKey( err );
            return res.status( 400 ).json( error );
        }
        return next( err );
    }

    // save new team into the database
    newTeam.save()
        .then( res.sendStatus( 201 ) )
        .catch( errorHandler );
}

exports.getTeamByIdOrName = ( req, res, next ) => {
    let getTeamInfo = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found' });

        let membersIDs = [];

        const isMember = team.members.findIndex( member => member.id.toString() === req.user.id ) > -1;

        if ( !isMember && team.author.toString() !== req.user.id && req.user.role !== ADMIN )
            return res.status( 403 ).json({ error: 'not allowed' });

        team.members.forEach( member => {
            membersIDs.push( member.id );
        });

        let sendTeamInfo = results => {

            let membersInfo = results[ 0 ];
            let author = results[ 1 ];

            let members = [];

            team.members.forEach( member => {
                const memberInfo = membersInfo.find( m => m._id.toString() === member.id.toString() );
                members.push({
                    _id: member.id,
                    role: member.role,
                    firstName: memberInfo.firstName,
                    lastName: memberInfo.lastName,
                    username: memberInfo.username,
                    isLeader: member.isLeader
                });
            });

            // team informations
            let teamInfo = {
                author,
                members,
                _id: team._id,
                name: team.name,
                company: team.company,
                started: team.started,
                finished: team.finished,
                isVerified: team.isVerified,
                isReady: team.isReady,
                teamIsReady: false
            };
            if ( members.length === 5 )
                teamInfo.teamIsReady = true
            return res.status( 200 ).json( teamInfo );
        }

        let filterIDs = {
            _id: {
                $in: membersIDs
            }
        };

        let Fields = 'firstName lastName username';

        let GET_USERS = [
            User.find( filterIDs, Fields ).exec(),          // get members
            User.findById( team.author, Fields ).exec()     // get author
        ];

        Promise.all( GET_USERS )
            .then( sendTeamInfo )
            .catch( err => next( err ) );
    }

    let filter = {
        $or: [
            { 'name': req.params.q || req.query.q }
        ]
    };

    // push _id property to filter[ '$or' ] array if (q) param is valid id
    if ( validID( req.params.q ) )
        filter[ '$or' ].push( { '_id': req.params.q } );

    // get team informations
    Team.findOne( filter ).exec()
        .then( getTeamInfo )
        .catch( err => next( err ) );
}

exports.updateTeamById = ( req, res, next ) => {
    // TODO update team
    // make leader functionality goes here
}

exports.deleteTeamById = ( req, res, next ) => {
    // TODO delete team
}

exports.getTeamsOfUserOrAdmin = ( req, res, next ) => {

    if ( req.user.id !== req.params.id )
        return res.sendStatus( 400 );

    if ( req.user.role === SUPERADMIN )
        return res.status( 200 ).json( [] );

    let filter;

    // setup admin filter
    if ( req.user.role === ADMIN )
        filter = {
            'author': req.params.id
        };

    // setup client filter
    if ( req.user.role === CLIENT )
        filter = {
            'members.id': req.params.id
        };

    Team.find( filter, '_id name company members.id' ).exec()
        .then( teams => res.status( 200 ).json( teams ) )
        .catch( err => next( err ) );
}

exports.addMemberToTeam = ( req, res, next ) => {

    if ( !req.body.adminId || !req.body.adminId.length )
        return res.status( 400 ).json( { error: 'missing admin id' } );

    if ( !req.body.teamId || !req.body.teamId.length )
        return res.status( 400 ).json( { error: 'missing team id' } );

    let addNewMember = results => {

        let user = results[ 0 ];
        let admin = results[ 1 ];
        let team = results[ 2 ];

        if ( !user || !admin || !team )
            return res.status( 404 ).json( { error: 'admin/team not found' } );

        // check if user is already member
        let memberIndex = team.members.findIndex(
            member => member.id.toString() === req.user.id
        );

        if ( memberIndex !== -1 )
            return res.status( 403 ).json( { error: 'already member' } );

        // return if the requested team has 5 members
        if ( team.members.length === 5 )
            return res.status( 403 ).json( { error: 'max number of members is 5' } );

        // push new member to the team
        team.members.push({ id: req.user.id });

        // check if request is exist
        let userRequest = user.teamRequests.findIndex(
            request => request.teamId.toString() === team._id.toString()
        );

        if ( userRequest === -1 )
            return res.status( 404 ).json( { error: 'request not found' } );

        // remove team request
        user.teamRequests.splice( userRequest, 1 );

        // push accept request notification to admin
        admin.notifications.push({
            subject: ACCEPT_REQUEST,
            date: new Date().toString(),
            sender: user._id
        });

        let SAVE_CHANGES = [
            user.save(),
            admin.save(),
            team.save()
        ];

        // save all changes asynchronous
        Promise.all( SAVE_CHANGES )
            .then( res.sendStatus( 201 ) )
            .catch( err => next( err ) );
    }

    let GET_DATA = [
        User.findById( req.user.id ),       // get user
        User.findById( req.body.adminId ),  // get admin
        Team.findById( req.body.teamId )    // get team
    ];

    // add new member to team
    Promise.all( GET_DATA )
        .then( addNewMember )
        .catch( err => next( err ) );
}

exports.removeMemberFromTeam = ( req, res, next ) => {
    if ( !req.body.userId || !req.body.userId.length )
        return res.status( 400 ).json( { error: 'missing user id' } );

    if ( !req.body.teamId || !req.body.teamId.length )
        return res.status( 400 ).json( { error: 'missing team id' } );

    let removeExistingMember = team => {
        if ( !team )
            return res.status( 404 ).json( { error: 'team not found' } );

        if ( req.user.id !== team.author.toString() )
            return res.status( 403 ).json( { error: 'not allowed' } );

        if ( team.isReady || team.started )
            return res.status( 403 ).json({ error: `you can't remove members now` });

        // check if member is not found
        let memberIndex = team.members.findIndex(
            member => member.id.toString() === req.body.userId
        );

        if ( memberIndex === -1 )
            return res.status( 404 ).json( { error: 'member not found' } );

        team.members.splice( memberIndex, 1 );

        team.save()
            .then( res.sendStatus( 200 ) )
            .catch( err => next( err ) );
    }

    Team.findById( req.body.teamId ).exec()
        .then( removeExistingMember )
        .catch( ( err ) => next( err ) );
}

exports.makeLeader = ( req, res, next ) => {
    if ( !req.body.teamId || !req.body.teamId.length )
        return res.status( 401 ).json({ error: 'missing team id' });

    if ( !req.body.userId || !req.body.userId.length )
        return res.status( 401 ).json({ error: 'missing user id' });

    const MakeLeader = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found' });

        if ( req.user.id !== team.author.toString() )
            return res.status( 403 ).json({ error: 'not allowed' });

        if ( team.isReady || team.started )
            return res.status( 403 ).json({ error: `you can't change the team leader now` });

        if ( team.members.findIndex( m => m.id.toString() === req.body.userId ) === -1 )
            return res.status( 403 ).json({ error: 'member not found' });

        team.members.forEach( member => {
            if ( member.id.toString() === req.body.userId )
                return member.isLeader = true
            member.isLeader = false
        });

        team.save()
            .then( res.sendStatus( 200 ) )
            .catch( err => next( err) );
    }

    Team.findByIdAndUpdate( req.body.teamId ).exec()
        .then( MakeLeader )
        .catch( err => next( err ) );
}

exports.changeReadyStateOfTeam = ( req, res, next ) => {
    if ( !req.body.teamId || !req.body.teamId.length )
        return res.status( 400 ).json({ error: 'missing team id' });

    const changeReadyState = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found' });

        if ( team.authot.toString() !== req.user.id.toString() )
            return res.status( 403 ).json({ error: 'not allowed' });

        team.isReady = true
        team.save()
            .then( res.sendStatus( 200 ) )
            .catch( err => mext( err ) );
    }

    Team.findById( req.body.teamId ).exec()
        .then( changeReadyState )
        .catch( err => next( err ) );
}
