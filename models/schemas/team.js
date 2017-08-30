const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const teamSchema = new Schema({
	// TODO complete team schema
    teamName: { type: String, require: true, unique: true, trim: true },
    companyName: String,
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    progress: {},
    status: {},
    players: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isLeader: Boolean,
        role: String,
        equipments: {
            personalGear: {},
            climbingGear: {},
            medicalGear: {},
            clothing: {}
        },
        role: { type: String, unique: true, trim: true },
        health: Number,
        level: Number,
        decisions: [{}]
    }],
    started: Boolean,
    finished: Boolean,
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
