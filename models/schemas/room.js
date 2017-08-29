const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

let roomSchema = new Schema({}); // TODO complete room schema

// TODO create pre(save) hooks

let Room = mongoose.model( 'Room', roomSchema );
module.exports = Room;
