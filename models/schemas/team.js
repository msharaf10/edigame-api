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
const { DOCTOR, ENGINEER } = require( '../../config/constants' ).memberRoles;

const Schema = mongoose.Schema;

// ==========================
// TEAM SCHEMA
// ==========================
// TODO: teamname: unique, name: { min: 6, max: 20 }
const teamSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    members: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: [ DOCTOR, ENGINEER ]
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
    isReady: {
        type: Boolean,
        default: false
    },
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
