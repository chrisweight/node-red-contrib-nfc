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

	function NFCNode(n) {

		RED.nodes.createNode(this, n);

		this.name = n.name;
		this.topic = n.topic;

		var node = this;

		try {
			this.n = new nfc.NFC();
		} catch (err) {
			node.log(err);
		}

		this.n
			.on('read', function (tag) {

				var _parsed, _output;

				if (!!tag.data && !!tag.offset) {
					_parsed = nfc.parse(tag.data.slice(tag.offset));
					console.log('read -> parsed', _parsed);
				}

				if (node.uid) {
					if (node.uid == tag.uid) {
						return;
					} else {
						node.uid = tag.uid;
					}
				} else {
					node.uid = tag.uid;
					node.timer = setTimeout(function () {
						delete node.timer;
						delete node.uid;
					}, 10000);
				}

				var msg = {};

				if (node.topic) {
					msg.topic = node.topic;
				}

				msg.payload = tag;
				
				node.send(msg);
			});


		try {
			this.n.start();
		} catch (err) {
			node.n.stop();

			node.reset = setTimeout(function () {
				node.log("late restart");
				node.n.start();
			}, 2000);

			node.reset.unref;
		}

		node
			.on('close', function () {
				try {
					if (node.timer) {
						clearTimeout(node.timer);
					}
					if (node.reset) {
						clearTimeout(node.reset);
					}
					node.n.stop();
				} catch (err) {
					node.error(err);
				}
			});
	};

	RED.nodes.registerType("nfc", NFCNode);
}