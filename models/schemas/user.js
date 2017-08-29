const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

let userSchema = new Schema({
	//====		Basic user info		====//
	firstName: { type: String, trim: true, required: true },
	lastName: { type: String, trim: true, required: true },
	email: { type: String, unique: true, sparse: true, trim: true },
	phone: { type: String, unique: true, spares: true },
	age: Number,
	//====		End Basic user info		====//
	isAdming: Boolean,
	companyName: String,
	role: String,
	tools: {}, // TODO define tools properties
	team: {
		id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
		isLeader: Boolean,
		role: String
	},
	level: Number //    feet    //
	decisions: [{}], // TODO define decisions
},
{
	toObject: { getters: true },
	timestamps: {
		createdAt: 'createdDate',
		updatedAt: 'updatedDate'
	}
});

// TODO create pre(save) hooks

// TODO create method for validating password

let User = mongoose.model( 'User', userSchema );
module.exports = User;
