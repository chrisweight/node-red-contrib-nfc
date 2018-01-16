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
//var RED = require(process.env.NODE_RED_HOME+"/red/red");
module.exports = function (RED) {

	var nfc = require('nfc').nfc;
	var debounce = require('debounce');

	function NFCNode(config) {

		RED.nodes.createNode(this, config);

		this.name = config.name;
		this.topic = config.topic;
		this.interval = config.interval;

		var node = this;

		try {
			this.nfcClient = new nfc.NFC();
		} catch (err) {
			node.log(err);
		}

		var debouncedSend = debounce(function (message) {
			node.send(message);
		}, node.interval);


		this.nfcClient
			.on('read', function (tag) {
				var parsed;

				if (!!tag.data && !!tag.offset) {
					parsed = nfc.parse(tag.data.slice(tag.offset));
				}

				var msg = {
					topic: node.topic,
					payload: {
						tag: tag,
						parsed: parsed
					}
				};

				debouncedSend(msg);
			})
			.on('close', function () {
				try {
					node.nfcClient.stop();
				} catch (err) {
					node.error(err);
				}
			})
			.on('error', function (error) {
				node.error(error);
			});

		try {
			this.nfcClient.start();
		} catch (err) {
			node.nfcClient.stop();
		}
	};

	RED.nodes.registerType("nfc", NFCNode);
}