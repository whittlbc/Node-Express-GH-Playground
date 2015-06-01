var express = require('express');
var router = express.Router();
var GitHubApi = require("github");
var util = require('util');
var exec = require('child_process').exec;
var github = new GitHubApi({
    version: "3.0.0",
    debug: true,
    protocol: "https",
    host: "api.github.com"
});


// After making sure they're actually a GH user (with Client-side OAuth), use the following to authenticate them on the Node side:
router.post('userLogin', function(req, res){

	github.authenticate({
		type: 'basic',
		username: req.body.username,
		password: req.body.password
	});

	res.send('Done creating repo');

});


// Get all repos for a user
router.post('getAllUserRepos', function(req, res){

	github.repos.getFromUser({user: req.body.username}, function(err, reposArray){

		if (err){
			res.send(err);
		}
		else {
			res.json(reposArray);
		}
	});

});


// Creating a Repo
router.post('createRepo', function(req, res){

	var repo = req.body.name;
	var root = req.body.root;

	github.repos.create({name: repo}, function(err, response){

		if (err){

			res.send(err);
		}
		else {

			res.send('Successfully created repo');

			var child = exec("mkdir "+root+repo+"; cd "+root+repo+"; git remote add origin 'https://github.com/"+req.body.username+"/"+repo+".git'", 
			  function (error, stdout, stderr) {
			    console.log('stdout: ' + stdout);
			    console.log('stderr: ' + stderr);
			    if (error != null) {
			      console.log('exec error: ' + error);
			    }
			});
		}
	});	

});


// Creating a branch
router.post('createBranch', function(req, res){

	var child = exec("cd "+req.body.root+req.body.repo+"; git checkout master; git checkout -b "+req.body.branch; 
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error != null) {
	      console.log('exec error: ' + error);
	      res.send('Error creating branch');
	    }
	    else {
			res.send('Successfully created branch');
	    } 
	});

});


// Make a commit
router.post('makeCommit', function(req, res){

	var child = exec("cd "+req.body.root+req.body.repo+"; git checkout "+req.body.branch+"; git init; git add -A .; git commit -m "+req.body.commitName+"; git push origin "+req.body.branch; 
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error != null) {
	      console.log('exec error: ' + error);
	    }
	});
});


// Submit PR
router.post('submitPR', function(req, res){

	var obj = {
		user: req.body.username,
		repo: req.body.repo,
		title: req.body.title,
		base: req.body.base,
		head: req.body.branch
	};

	github.pullRequests.create(obj, function(error, response){

		if (err){

			console.log(error);
			res.send('Error creating PR');
		}
		else {

			res.send('Successfully created PR');
		}
	});
});


// Get issues for a repo
router.post('getIssues', function(req, res){

	github.issues.repoIssues({user: req.body.username, repo: req.body.repo}, function(error, issues){

		if (err){

			console.log(error);
			res.send('Error getting issues for repo');
		}
		else {

			res.json(issues);
		}
	}); 

});







module.exports = router;








