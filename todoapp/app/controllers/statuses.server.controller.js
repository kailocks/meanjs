'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Status = mongoose.model('Status'),
	_ = require('lodash');

/**
 * Create a Status
 */
exports.create = function(req, res) {
	var status = new Status(req.body);
	status.user = req.user;

	status.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//take out socket instance form the app
			var socketio = req.app.get('socketio');
			//emit an event for all connected clients
			socketio.sockets.emit('status.created', status);
			res.jsonp(status);
		}
	});
};

/**
 * Show the current Status
 */
exports.read = function(req, res) {
	var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
	socketio.sockets.emit('status.read', req.status); // emit an event for all connected clients
	res.jsonp(req.status);
};

/**
 * Update a Status
 */
exports.update = function(req, res) {
	var status = req.status ;

	status = _.extend(status , req.body);

	status.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var socketio = req.app.get('socketio'); // take out socket instance from the app container
			socketio.sockets.emit('status.update', status); // emit an event for all connected clients
			res.jsonp(status);
		}
	});
};

/**
 * Delete an Status
 */
exports.delete = function(req, res) {
	var status = req.status ;
	status.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
			socketio.sockets.emit('status.delete', status); // emit an event for all connected clients
			res.jsonp(status);
		}
	});
};

/**
 * List of Statuses
 */
exports.list = function(req, res) { 
	Status.find().sort('-created').populate('user', 'displayName').exec(function(err, statuses) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
			socketio.sockets.emit('status.list', statuses); // emit an event for all connected clients
			res.jsonp(statuses);
		}
	});
};

/**
 * Status middleware
 */
exports.statusByID = function(req, res, next, id) { 
	Status.findById(id).populate('user', 'displayName').exec(function(err, status) {
		if (err) return next(err);
		if (! status) return next(new Error('Failed to load Status ' + id));
		req.status = status ;
		next();
	});
};

/**
 * Status authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.status.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
