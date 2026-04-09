export default class MqttService {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
  }

  connect() {
    this.ws = new WebSocket("wss://distributeurcle.edwrdledgar.me/mqtt", ["mqtt"]);
    this.ws.binaryType = "arraybuffer";
    console.log("WS création, état:", this.ws.readyState);

    this.ws.onmessage = (e) => {
      try {
        if (!(e.data instanceof ArrayBuffer)) {
          console.log("WS message ignoré (pas binaire):", e.data);
          return;
        }

        console.log("WS message reçu, taille:", e.data.byteLength);

        const data = new Uint8Array(e.data);

        // CONNACK
        if (data[0] === 0x20 && data[3] === 0x00) {
          console.log("CONNACK reçu, abonnement en cours...");
          const encoder = new TextEncoder();
          const topic = encoder.encode("distributeur/cle");

          const subPacket = new Uint8Array([
            0x82, 0,
            0x00, 0x01,
            0x00, topic.length, ...topic,
            0x00,
          ]);

          subPacket[1] = subPacket.length - 2;
          this.ws.send(subPacket.buffer);
          return;
        }

        if ((data[0] & 0xf0) === 0x30) {
          const topicLength = (data[2] << 8) | data[3];
          const messageStart = 4 + topicLength;

          const decoder = new TextDecoder();
          const message = decoder.decode(data.slice(messageStart));

          console.log("Message MQTT reçu:", message);

          if (this.onMessage) {
            this.onMessage(message);
          }
        }

      } catch (err) {
        console.log("WS PARSE ERROR:", err);
      }
    };
  }

  publish(messageText) {
    console.log("publish appelé, ws état:", this.ws?.readyState); // ← ajout
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("WS pas prêt, abandon publish"); // ← ajout
      return;
    }
    const encoder = new TextEncoder();
    const topic = encoder.encode("distributeur/cle");
    const message = encoder.encode(messageText);
    const pubPacket = new Uint8Array([
      0x30, 0,
      0x00, topic.length, ...topic,
      ...message,
    ]);
    pubPacket[1] = pubPacket.length - 2;
    this.ws.send(pubPacket.buffer);
    console.log("Message publié:", messageText); // ← ajout
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}