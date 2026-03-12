export default class MqttService {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
  }

  connect() {
    this.ws = new WebSocket("wss://distributeurcle.edwrdledgar.me/mqtt", ["mqtt"]);
    console.log("WS création, état:", this.ws.readyState); // ← ajout

    this.ws.onopen = () => {
      console.log("WS connecté !"); // ← ajout
      const encoder = new TextEncoder();
      const clientId = "expo_sub_" + Math.random().toString(16).substr(2, 8);
      const clientIdBytes = encoder.encode(clientId);
      const usernameBytes = encoder.encode("apiuser");
      const passwordBytes = encoder.encode("ApiPass10!");
      const connectPacket = new Uint8Array([
        0x10, 0,
        0x00, 0x04, 0x4d, 0x51, 0x54, 0x54,
        0x04,
        0xc2,
        0x00, 0x3c,
        0x00, clientIdBytes.length, ...clientIdBytes,
        0x00, usernameBytes.length, ...usernameBytes,
        0x00, passwordBytes.length, ...passwordBytes,
      ]);
      connectPacket[1] = connectPacket.length - 2;
      this.ws.send(connectPacket.buffer);
    };

    this.ws.onerror = (e) => {
      console.log("WS ERREUR:", e.message); // ← ajout
    };

    this.ws.onclose = (e) => {
      console.log("WS FERMÉ - code:", e.code, "raison:", e.reason); // ← ajout
    };

    this.ws.onmessage = (e) => {
      console.log("WS message reçu, taille:", e.data?.byteLength); // ← ajout
      const data = new Uint8Array(e.data);
      if (data[0] === 0x20 && data[3] === 0x00) {
        console.log("CONNACK reçu, abonnement en cours..."); // ← ajout
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
      }
      if ((data[0] & 0xf0) === 0x30) {
        const topicLength = (data[2] << 8) | data[3];
        const messageStart = 4 + topicLength;
        const decoder = new TextDecoder();
        const message = decoder.decode(data.slice(messageStart));
        console.log("Message MQTT reçu:", message); // ← ajout
        if (this.onMessage) {
          this.onMessage(message);
        }
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