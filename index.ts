import { randomUUIDv7 } from 'bun';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let sender: null | WebSocket = null;

let receiver: null | WebSocket = null;

let senderId: string | null = null;
let receiverId: string | null = null;

wss.on('connection', (ws) => {
	console.log('New client connected');

	ws.on('message', (data: any) => {
		const message = JSON.parse(data);
		if (message.type === 'sender') {
			sender = ws;
			senderId = senderId === null ? randomUUIDv7() : senderId;
			console.log('Sender connected with ID:', senderId);
		}
		else if (message.type === 'receiver') {
			receiver = ws;
			receiverId = receiverId === null ? randomUUIDv7() : receiverId;
			console.log('Receiver connected with ID:', receiverId);
		}
		else if (message.type === 'createOffer') {
			if (ws !== sender) {
				console.error('Only sender can create offer');
				return;
			}
			console.log('Creating offer');

			receiver?.send(JSON.stringify({ type: message.type, sdp: message.sdp }));
			console.log('sender ' + senderId + ' sent an offer');
		}

		else if (message.type === 'answer') {
			if (ws !== receiver) {
				console.error('Only receiver can send answer');
				return;
			}
			sender?.send(JSON.stringify({ type: message.type, sdp: message.sdp }));
			console.log('receiver ' + receiverId + ' answered the offer');

		}
		else if (message.type === 'candidate') {
			if (ws === sender) {
				receiver?.send(JSON.stringify({ type: message.type, candidate: message.candidate }));
			} else if (ws === receiver) {
				sender?.send(JSON.stringify({ type: message.type, candidate: message.candidate }));
			}
		}


	})
})
