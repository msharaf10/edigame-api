const User = require( '../models/schemas/user' );
const Team = require( '../models/schemas/team' );

const constants = require( '../config/constants' );
const { validID } = require( '../helpers/helpers' );

const { SUPERADMIN, ADMIN, CLIENT } = constants.userRoles;
const ROLES = [ SUPERADMIN, ADMIN, CLIENT ]

exports.getTeamByIdOrName = ( req, res, next ) => {
    const getTeamInfo = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found' });

        const membersIDs = [],
            isMember = false;

        team.members.forEach( member => {
            if ( member.id.toString() === req.user.id.toString() ) {
                isMember = true;
                return
            }
        });

        if ( team.members.findIndex( m => m.id.toString() === req.user.id.toString() ) === -1 )
            return res.status( 403 ).json({ error: 'not allowed' });

        team.members.forEach( member => {
            membersIDs.push( member.id );
        });

        const sendTeamInfo = results => {
            const membersInfo = results[ 0 ];
            const author = results[ 1 ];

            const members = [];

            team.members.forEach( member => {
                const memberInfo = membersInfo.find( m => m._id.toString() === member.id.toString() );
                members.push({
                    firstName: memberInfo.firstName,
                    lastName: memberInfo.lastName,
                    username: memberInfo.username,
                    _id: member.id,
                    role: member.role,
                    isLeader: member.isLeader
                });
            });

            // team informations
            const teamInfo = {
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

        const filterIDs = {
            _id: {
                $in: membersIDs
            }
        };

        const Fields = 'firstName lastName username';

        const GET_USERS = [
            User.find( filterIDs, Fields ).exec(),          // get members
            User.findById( team.author, Fields ).exec()     // get author
        ];

        Promise.all( GET_USERS )
            .then( sendTeamInfo )
            .catch( err => next( err ) );
    }

    const filter = {
        $or: [
            { 'name': req.params.q || req.query.q }
        ]
    };

    // push _id property to filter[ '$or' ] array if (q) param is valid id
    if ( validID( req.params.q ) )
        filter[ '$or' ].push({ '_id': req.params.q });

    // get team informations
    Team.findOne( filter ).exec()
        .then( getTeamInfo )
        .catch( err => next( err ) );
}

exports.toggleReadyState = ( req, res, next ) => {
    const toggleReady = team => {
        if ( !team )
            return res.status( 404 ).json({ erroe: 'team not found' });

        if ( team.members.findIndex( m => m.id.toString() === req.user.id.toString() ) > -1 )
            return res.status( 403 ).json({ error: 'not allowed' });

        const memberIndex = team.members.findIndex( m => m.id.toString() === req.user.id.toString() );

        if ( memberIndex === -1 )
            return res.status( 404 ).json({ error: 'member not found' });

        team.members[ memberIndex ].isReady = !team.members[ memberIndex ].isReady;

        team.save()
            .then( () => res.sendStatus( 200 ) )
            .catch( err => next( err ) );
    }

    Team.findById( req.params.id ).exec()
        .then( toggleReady )
        .catch( err => next( err ) );
}

exports.getReadyMembers = ( req, res, next ) => {
    const sendReadyMembers = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found' });

        if ( team.members.findIndex( m => m.id.toString() === req.user.id.toString() ) > -1 )
            return res.status( 403 ).json({ error: 'not allowed' });

        const readyMembers = [];
        team.members.forEach( member => {
            if ( member.isReady === true )
                readyMembers.push( member.id );
        });
        res.status( 200 ).json( readyMembers );
    }

    Team.findById( req.body.teamId || req.params.id ).exec()
        .then( sendReadyMembers )
        .catch( err => next( err ) );
}

exports.changeMemberRole = ( req, res, next ) => {
    if ( !req.body.teamId || !req.body.teamId.length || !validID( req.body.teamId ) )
        return res.status( 400 ).json({ error: 'missing team id' });

    if ( !req.body.role || typeof req.body.role !== 'string' || !req.body.role.length )
        return res.status( 400 ).json({ error: 'missing role' });

    if ( ROLES.indexOf( req.body.role ) === -1 )
        return res.status( 400 ).json({ error: 'invalid role' });

    const changeRole = team => {
        if ( !team )
            return res.status( 404 ).json({ error: 'team not found '});

        if ( team.started )
            return res.status( 403 ).json({ error: `you can't change your role after team is started` });

        if ( !team.isReady )
            return res.status( 403 ).json({ error: 'team must be ready to change your role' });

        const index = team.members.findIndex( m => m.id.toString() === req.user.id.toString() )
        if ( index === -1 )
            return res.status( 400 ).json({ error: 'you are not a member' });

        team.members[ index ].role = req.body.role

        res.sendStatus( 200 );
    }

    Team.findOne( { '_id': req.body.teamId } ).exec()
        .then( changeRole )
        .catch( err => next( err ) );
}

exports.startRun = ( req, res, next ) => {
    // TODO: team start run
}
