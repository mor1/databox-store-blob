const EventEmitter = require('events');

// TODO: Singleton vs OOP?
module.exports = class extends EventEmitter {
	constructor(wss) {
		this.wss = wss;
		this.clients = {};

		wss.on('connection', (ws) => {
			// If the client made it this far
			// - The macaroon has already been verified an made available
			// - They definitely have access to WS subscription
			var macaroon = ws.upgradeReq.macaroon;

			// TODO: See me-box/databox-store-blob issue #19
			this.clients[macaroon.identifier] = ws;

			ws.on('close', () => {
				delete this.clients[macaroon.identifier];
				console.log('Client parted:', macaroon.identifier);
			});
		})
	}

	sub() {
		return (req, res) => {
			// TODO: See me-box/databox-store-blob issue #19
			const id   = req.macaroon.identifier;
			const path = '/' + req.params[0];
			// NOTE: Don't need to check anyhting here since it's all already covered by the path caveat


			if (!(id in this.clients)) {
				// TODO: See me-box/databox-store-blob issue #19
				res.status(409).send('No open WebSocket connection to client; WebSocket connection must exist before subscription requests');
				return;
			}

			var ws = this.clients[id];

			var listener = (data) => {
				// TODO: Error handling
				ws.send(JSON.stringify(data));
			};

			this.on(path, listener);

			ws.on('close', () => {
				this.removeListener(path, listener)l
			});

			res.send();
		};
	}

	unsub() {
		return (req, res) => {
			// TODO: Implement with removeListener like above
			res.sendStatus(501);
		};
	}
};
