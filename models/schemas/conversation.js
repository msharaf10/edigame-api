/*
*
*  ->  FILENAME :    conversation.js
*
*  ->  RESPONSIBILITY :
*           Modeling conversation data.
*
*  ->  DESCRIPTION :
*
*  ->  LAST MODIFIED BY :
*           Mohamed Sharaf
*
*/

const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    conversations: [{
        member: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        message: {
            type: String,
            required: true
        },
        date: Date
    }]
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

// Compiling Conversation schema into a model
let Conversation = mongoose.model( 'Conversation', conversationSchema );
module.exports = Conversation;
