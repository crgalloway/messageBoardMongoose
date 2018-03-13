const express = require('express');
const app = express();

var path = require('path')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname+'/views'))

const bp = require('body-parser')
app.use(bp.urlencoded({ extended:true }))

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/postBoard')
var Schema = mongoose.Schema;

// Schemas go here==>
var PostSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 4},
	text: {type: String, required: true},
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps:true })
var CommentSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 4},
	text: {type: String, required: true},
	_post: {type: Schema.Types.ObjectId, ref: 'Post'}
}, {timestamps:true})
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// <== end schemas

// Routes go here ==>
app.get('/', function(req, res){
	Post.find().sort({createdAt:-1}).find({}).populate('comments').exec(function(err, posts){
		res.render('index',{posts:posts});
	})
})
app.post('/postPost', function(req,res){
	var post = new Post({name: req.body.name, text: req.body.text})
	post.save(function(err){
		if (err){
			console.log('something went wrong');
		} else{
			res.redirect('/');
		}
	})
})
app.post('/postComment/:id', function(req,res){
	Post.findOne({_id:req.params.id}, function(err, post){
		var comment = new Comment({name: req.body.name, text: req.body.text});
		comment._post = post._id;
		comment.save(function(err){
			post.comments.push(comment);
			post.save(function(err){
				if (err){
					console.log('something went wrong');
				} else{
					res.redirect('/');
				}
			})
		})
	})
})
// <== end routes

app.listen(8000, function() {
	console.log("listening on port 8000");
})