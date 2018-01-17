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

	var debounce = require('debounce'),
		nfc 	 = require('nfc').nfc;

	function NFCNode(config) {

		RED.nodes.createNode(this, config);

		this.name 	= config.name;
		this.topic 	= config.topic;

		this.status = {
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

		node.onRead = function(tag) {
			var msg = {
				topic: node.topic,
				payload: {
					tag: tag
				}
			};

			node.send(msg);
		};

		node.debouncedRead = debounce(node.onRead, 1000, true);

		try {
			node.log('About to try and start NFC client');
			this.nfcClient = new nfc.NFC();
		} catch (err) {
			node.error(err);
			node.status(status.error);
		}

		this.nfcClient
			.on('read', function (tag) {
				if (node.uid === tag.uid) {
					node.debouncedRead(tag);
					return;
				}

				node.uid = tag.uid;
				node.onRead(tag);
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