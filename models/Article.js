const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Articleschema = new Schema({
	title: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	summary: {
		type: String,
		default: 'Summary unavailable'
	},
	img: {
		type: String,
		default: '../public/images/unavailable.jpg'
	},
	saved: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: 'Save Article'
	},
	created: {
		type: Date,
		default: Date.now
	},
	note: {
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}
});

Articleschema.index({title: 'text'});

let Article  = mongoose.model('Article', Articleschema);

module.exports = Article;