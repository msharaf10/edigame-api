const Team = require( '../models/schemas/team' );
const User = require( '../models/schemas/user' );

const constants = require( '../models/constants' );

const { FIELDS } = constants;
const { ACCEPT_REQUEST } = constants.subjects;
const { SUPERADMIN, ADMIN, CLIENT } = constants.userRoles;
const { hasSpace, validEmail, validID, catchDuplicationKey } = require( '../helpers/helpers' );

exports.getTeams = ( req, res, next ) => {

    let fields = '_id name company';

    Team.find( {}, fields ).exec()
        .then( teams => res.status( 200 ).json( teams ) )
        .catch( err => next( err ) );
}

// TODO create new chat to the new team
exports.createTeam = ( req, res, next ) => {

    let requiredParams = [ 'name', 'company' ],
        missingParam = false;

    requiredParams.forEach( param => {
        if ( missingParam ) return;

        if ( !req.body[ param ] || typeof req.body[ param ] !== 'string' || !req.body[ param ].length )
        	missingParam = `missing ${ param }`;
    });

    if ( missingParam )
        return res.status( 400 ).json( { error: missingParam } );

    // validate team name
    if ( hasSpace( req.body.teamName ) )
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
        .then( () => res.sendStatus( 201 ) )
        .catch( errorHandler );
}

exports.getTeamByIdOrName = ( req, res, next ) => {

    let getTeamInfo = team => {
        if ( !team )
            return res.status( 404 ).json( { error: 'team not found' } );

        let membersIDs = [],
            notMember = false;

        team.members.forEach( member => {
            if ( notMember ) return;

            if ( member.id.toString() !== req.user.id.toString() )
                notMember = true;

            membersIDs.push( member.id );
        });

        if ( notMember && team.author.toString() !== req.user.id.toString() )
            return res.status( 403 ).json( { error: 'not member' } );

        let sendTeamInfo = results => {

            let members = results[ 0 ];
            let author = results[ 1 ];

            // team informations
            let teamInfo = {
                id: team._id,
                name: team.name,
                company: team.company,
                started: team.started,
                finished: team.finished,
                members: team.members,
                author,
                members
            };
            return res.status( 200 ).json( teamInfo );
        }

        let filterIDs = {
            _id: {
                $in: membersIDs
            }
        };

        let authorFields = '_id firstName lastName username';

        let GET_USERS = [
            User.find( filterIDs, FIELDS ).exec(),              // get members
            User.findById( team.author, authorFields ).exec()   // get author
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
        return res.sendStatus( 403 );

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

    Team.find( filter ).exec()
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
        team.members.push({
            id: req.user.id
        });

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
        .then( () => res.sendStatus( 201 ) )
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
    // TODO remove any team info associated with the member

    if ( !req.body.userId || !req.body.userId.length )
        return res.status( 400 ).json( { error: 'missing user id' } );

    if ( !req.body.teamId || !req.body.teamId.length )
        return res.status( 400 ).json( { error: 'missing team id' } );

    let removeExistingMember = team => {
        if ( !team )
            return res.status( 404 ).json( { error: 'team not found' } );

        // check if member is not found
        let memberIndex = team.members.findIndex(
            member => member.id.toString() === req.body.userId
        );

        if ( memberIndex === -1 )
            return res.status( 404 ).json( { error: 'member not found' } );

        team.members.splice( memberIndex, 1 );

        team.save()
            .then( () => res.sendStatus( 200 ) )
            .catch( err => next( err ) );
    }

    Team.findById( req.body.teamId ).exec()
        .then( removeExistingMember )
        .catch( ( err ) => next( err ) );
}

exports.getReadyMembers = ( req, res, next ) => {

    let sendReadyMembers = team => {
        if ( !team )
            return res.status( 404 ).json( { error: 'team not found' } );

        // check if requester is a team member or admin
        let found = false;

        team.members.forEach( member => {
            if ( found ) return;

            if ( member.id.toString() === req.user.id )
                found = true;
        });

        if ( !found && team.author.toString() !== req.user.id )
            return res.sendStatus( 401 );

        let readyMembers = team.members.filter( member => {
            if ( member.isReady )
                return member;
        });

        return res.status( 200 ).json( readyMembers );
    }

    Team.findById( req.body.teamId || req.params.id ).exec()
        .then( sendReadyMembers )
        .catch( err => next( err ) );
}

exports.toggleReadyState = ( req, res, next ) => {

    let toggleReady = team => {
        if ( !team )
            return res.status( 404 ).json( { erroe: 'team not found' } );

        let memberIndex = team.members.findIndex(
            member => member.id.toString() === req.user.id
        );

        if ( memberIndex === -1 )
            return res.status( 404 ).json( { error: 'member not found' } );

        team.members[ memberIndex ].isReady = !team.members[ memberIndex ].isReady;

        team.save()
            .then( () => res.sendStatus( 200 ) )
            .catch( err => next( err ) );
    }

    Team.findById( req.params.id ).exec()
        .then( toggleReady )
        .catch( err => next( err ) );
}
