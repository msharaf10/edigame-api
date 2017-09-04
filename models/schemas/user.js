const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt-nodejs' );

const Schema = mongoose.Schema;

let userSchema = new Schema({
	firstName: { type: String, trim: true, required: true },
	lastName: { type: String, trim: true, required: true },
	email: { type: String, unique: true, sparse: true, trim: true },
	phone: { type: String, unique: true, spares: true },
	isAdmin: { type: Boolean, default: false },
	companyName: String,
	team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
	hash: String,
	token: String
},
{
	toObject: { getters: true },
	timestamps: {
		createdAt: 'createdDate',
		updatedAt: 'updatedDate'
	}
});

// TODO create pre(save) hooks
userSchema.pre( 'save', function( callback ) {
	if ( !this.email ) return callback( new Error( 'missing email' ) );
	if ( !this.hash ) return callback( new Error( 'missing password' ) );

	if ( this.isModified( 'hash' ) )
		this.hash = bcrypt.hashSync( this.hash );
	callback();
});

userSchema.methods.comparePassword = function( pw, callback ) {
	bcrypt.compare( pw, this.hash, function( err, isMatch ) {
		if ( err ) return callback( err );
		callback( null, isMatch );
	});
}

let User = mongoose.model( 'User', userSchema );
module.exports = User;
