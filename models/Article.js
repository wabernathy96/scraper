const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Articleschema = new Schema({
	title: {
		type: String,
    required: true,
    /*validate: {
      validator: function(title, cb) {
        //console.log('title', title);
        Article.find({title}, function(err,docs) {
          console.log('docs.length', docs.length);
          let isDuplicate = docs.length !== 0;
          //cb(isDuplicate);
          return isDuplicate;
        });
      },
      message: 'Article already exists!'
    },*/
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