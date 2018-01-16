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

	var nfc 		= require('nfc').nfc;
	var debounce 	= require('debounce');

	function NFCNode(n) {

		RED.nodes.createNode(this, n);

		this.name 		= n.name;
		this.topic 		= n.topic;
		this.interval 	= n.interval;

		var node = this;

		var onRead = function (tag) {
			var _parsed, _output;

			if (!!tag.data && !!tag.offset) {
				_parsed = nfc.parse(tag.data.slice(tag.offset));
			}

			var msg = {
				topic: node.topic,
				payload: {
					tag: tag,
					parsed: _parsed
				}
			};

			node.send(msg);
		}

		var onClose = function () {
			try {
				node.n.stop();
			} catch (err) {
				node.error(err);
			}
		}

		var onError = function (error) {
			node.error(error);
		}

		try {
			this.n = new nfc.NFC();
		} catch (err) {
			node.log(err);
		}

		this.n
			.on('read', debounce(onRead, node.interval))
			.on('close', onClose)
			.on('error', onError);

		try {
			this.n.start();
		} catch (err) {
			node.n.stop();
		}
	};

	RED.nodes.registerType("nfc", NFCNode);
}