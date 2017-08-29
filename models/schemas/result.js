const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

let resultSchema = new Schema({}); // TODO complete result schema

let Result = mongoose.model( 'Result', resultSchema );
module.exports = Result;
