import { randomUUIDv7 } from 'bun';
import { WebSocket, WebSocketServer } from 'ws';




export class SignalingServer {
  server: WebSocketServer;
  sender: null | WebSocket = null;
  receiver: null | WebSocket = null;
  senderId: string | null = null;
  receiverId: string | null = null;
  private constructor({ port }: { port: number }) {
    this.server = new WebSocketServer({ port })
  }

  static getInstance({ port }: { port: number }) {
    const instance = new SignalingServer({ port });
    return instance;
  }

  start() {
    const wss = this.server;

    wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');

      ws.on('message', (data: any) => {
        const message = JSON.parse(data);
        if (message.type === 'sender') {
          this.sender = ws;
          // set sender id to random UUID
          this.senderId = this.senderId === null ? randomUUIDv7() : this.senderId;
          console.log('Sender connected with ID:', this.senderId);
        }
        else if (message.type === 'receiver') {
          this.receiver = ws;

          // set receiver id to random UUID
          this.receiverId = this.receiverId === null ? randomUUIDv7() : this.receiverId;
          console.log('Receiver connected with ID:', this.receiverId);
        }
        else if (message.type === 'createOffer') {
          if (ws !== this.sender) {
            console.error('Only sender can create offer');
            return;
          }
          console.log('Creating offer');

          this.receiver?.send(JSON.stringify({ type: message.type, sdp: message.sdp }));
          console.log('sender ' + this.senderId + ' sent an offer');
        }

        else if (message.type === 'answer') {
          if (ws !== this.receiver) {
            console.error('Only receiver can send answer');
            return;
          }
          this.sender?.send(JSON.stringify({ type: message.type, sdp: message.sdp }));
          console.log('receiver ' + this.receiverId + ' answered the offer');

        }
        else if (message.type === 'candidate') {
          if (ws === this.sender) {
            this.receiver?.send(JSON.stringify({ type: message.type, candidate: message.candidate }));
          } else if (ws === this.receiver) {
            this.sender?.send(JSON.stringify({ type: message.type, candidate: message.candidate }));
          }
        }
      })
    })

  }
}
