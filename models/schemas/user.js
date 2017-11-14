/*
*
*  ->  FILENAME :    user.js
*
*  ->  RESPONSIBILITY :
*			Modeling users data.
*
*  ->  DESCRIPTION :
*
*  ->  LAST MODIFIED BY :
*			Mohamed Sharaf
*
*/

const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );

const { SUPERADMIN, ADMIN, CLIENT } = require( '../constants' ).userRoles;
const ROLES = [ SUPERADMIN, ADMIN, CLIENT ];

const Schema = mongoose.Schema;

// ==========================
// USER SCHEMA
// ==========================
let userSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		required: true
	},
	lastName: {
		type: String,
		trim: true,
		required: true
	},
	username: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		sparse: true
	},
	hash: {
		type: String,
		requierd: true
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	role: {
		type: String,
		enum: ROLES,
		default: CLIENT
	},
	notifications: [{
		subject: String,
		date: Date,
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		seen: {
			type: Boolean,
			default: false
		},
		read: {
			type: Boolean,
			default: false
		}
	}],
	teamRequests: [{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Team'
		},
		date: Date
	}],
	imgURL: String,
	token: String
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

// Middleware (pre hooks)
userSchema.pre( 'save', function( callback ) {
	let user = this,
		saltRounds = 10;

	// hash password if it has been modified or it's new
	if ( !user.isModified( 'hash' ) )
		return callback();

	// generate a salt
	bcrypt.genSalt( saltRounds, ( err, salt ) => {
		if ( err ) return callback( err );

		// hash the password with a new salt
		bcrypt.hash( user.hash, salt, ( err, hash ) => {
			if ( err ) return callback( err );

			// override the user's plaintext password with the hashed one
			user.hash = hash;
			callback();
		});
	});
});

// define (comparePassword) method
userSchema.methods.comparePassword = function( pw, callback ) {
	let user = this;

	// compare user's plaintext password with their hash
	bcrypt.compare( pw, user.hash, ( err, isMatch ) => {
		if ( err ) return callback( err );

		callback( null, isMatch );
	});
}

// Compiling User schema into a model
let User = mongoose.model( 'User', userSchema );
module.exports = User;
