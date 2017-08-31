const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const teamSchema = new Schema({
    teamName: { type: String, require: true, unique: true, trim: true },
    companyName: String,
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    progress: {},
    status: {},
    players: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isLeader: { type: Boolean, default: false },
        isReady: { type:Boolean, default: false },
        equipments: {
            personalGear: {},
            climbingGear: {},
            medicalGear: {},
            clothing: {}
        },
        role: { type: String, unique: true, trim: true },
        health: { type: Number, default: 100 },
        level: { type: Number, default: 0 },
        decisions: [{
    		level: String,
    		scenario: String,
    		options: {},
    		decision: String
    	}]
    }],
    started: { type: Boolean, default: false },
    finished: { type: Boolean, default: false }
},
{
	toObject: { getters: true },
	timestamps: {
		createdAt: 'createdDate',
		updatedAt: 'updatedDate'
	}
});

// TODO create pre(save) hooks

let Team = mongoose.model( 'Team', teamSchema );
module.exports = Team;
