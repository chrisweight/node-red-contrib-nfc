/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// Require main module
// var RED = require(process.env.NODE_RED_HOME+"/red/red");
module.exports = function (RED) {

	var nfc = require('nfc').nfc;

	function NFCNode(config) {

		RED.nodes.createNode(this, config);

		this.name 	= config.name;
		this.topic 	= config.topic;

		// Not using this just yet as it isn't really the right approach...
		var debounce = function (func, wait, immediate) {
			var timeout;

			return function () {
				var context = this,
					args 	= arguments;

				var later = function () {
					timeout = null;

					if (!immediate) {
						func.apply(context, args);
					}
				}

				var callNow = immediate && !timeout;

				clearTimeout(timeout);

				timeout = setTimeout(later, wait);

				if (callNow) {
					func.apply(context, args);
				}
			};
		};


		var throttle = function(func, wait) {
			var last, deferTimer;
			
			return function() {
				var context = this,
					args 	= arguments,
					now		= +new Date;

				if (last && now < last + wait) {
					clearTimeout(deferTimer);
					
					deferTimer = setTimeout(function() {
						last = now;
						func.apply(context, args);
					}, wait);

					return;
				}
				
				last = now;
				func.apply(context, args);
			};
		};

		var status = {
			connected: {
				fill: 'green',
				shape: 'dot',
				text: 'Connected'
			},
			disconnected: {
				fill: 'red',
				shape: 'dot',
				text: 'Disconnected'
			},
			error: {
				fill: 'red',
				shape: 'ring',
				text: 'Error'
			}
		};

		var node = this;

		function onRead(tag) {
			node.send({
				topic: node.topic,
				payload:tag
			});
		};

		// var debouncedRead = debounce(onRead, 1000, true);
		var throttledRead = throttle(onRead, 1000);

		var initTimeout;

		try {
			node.log('About to try and start NFC client');
			
			if (!!initTimeout) {
				return;
			}

			clearTimeout(initTimeout);
			this.nfcClient = new nfc.NFC();
		} catch (err) {
			node.error(err);
			node.status(status.error);

			nfc.stop()

			initTimeout = setTimeout(function() {
				node.nfcClient = new nfc.NFC();
			}, 1000);
		}

		this.nfcClient
			.on('read', function (tag) {
				if (node.uid === tag.id) {
					throttledRead(tag);
					return;
				}

				node.uid = tag.uid;
				onRead(tag);
			})
			.on('close', function () {
				try {
					node.nfcClient.stop();
					node.status(status.disconnected);
				} catch (err) {
					node.error(err);
					node.status(status.error);
				}
			})
			.on('error', function (error) {
				node.error(error);
				node.status(status.error);
			});

		try {
			node.nfcClient.start();
			node.status(status.connected);
		} catch (err) {
			node.status(status.error);
			node.error(err)
			node.nfcClient.stop();
		}
	};

	RED.nodes.registerType("nfc", NFCNode);
}