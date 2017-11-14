const mongoose = require( 'mongoose' );

const User = require( '../models/schemas/user' );
const Team = require( '../models/schemas/team' );

const constants = require( '../models/constants' );

exports.searchUsers = ( req, res, next ) => {
    // TODO search clients
}

exports.searchTeams = ( req, res, next ) => {
    // TODO search teams
}

exports.searchAny = ( req, res, next ) => {
    // TODO search any
}
