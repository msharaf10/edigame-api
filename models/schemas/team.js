/*
*
*  ->  FILENAME :    team.js
*
*  ->  RESPONSIBILITY :
*           Modeling teams data.
*
*  ->  DESCRIPTION :
*
*  ->  LAST MODIFIED BY :
*           Mohamed Sharaf
*
*/

const mongoose = require( 'mongoose' );

const { DOCTOR, ENGINEER } = require( '../constants' ).memberRoles;
const ROLES = [ DOCTOR, ENGINEER ];

const Schema = mongoose.Schema;

// ==========================
// TEAM SCHEMA
// ==========================
const teamSchema = new Schema({
    name: {
        type: String,
        trim: true,
        require: true,
        unique: true
    },
    company: {
        type: String,
        require: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    idVerified: {
        type: Boolean,
        default: false
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    members: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ROLES
        },
        isLeader: {
            type: Boolean,
            default: false
        },
        isReady: {
            type: Boolean,
            default: false
        },
        health: {
            type: Number,
            default: 100
        },
        level: {
            type: Number,
            default: 0
        },
        tools: {},
        decisions: []
    }],
    progress: {},
    status: {},
    started: {
        type: Boolean,
        default: false
    },
    finished: {
        type: Boolean,
        default: false
    }
},
{
	toObject: {
        getters: true
    },
	timestamps: {
		createdAt: 'createdDate',
		updatedAt: 'updatedDate'
	}
});

// Compiling Team schema into a model
let Team = mongoose.model( 'Team', teamSchema );
module.exports = Team;
