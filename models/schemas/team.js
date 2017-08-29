const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const teamSchema = new Schema({
	// TODO complete team schema
});

// TODO create pre(save) hooks

let Team = mongoose.model( 'Team', teamSchema );
module.exports = Team;
