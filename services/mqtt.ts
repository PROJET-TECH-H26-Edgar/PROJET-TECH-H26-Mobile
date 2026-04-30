//Cette partie à été généré par l'ia
//Dans mon ca j'ai changé le fait que le MQTT ne se connecte pas à 1 seul topic mais qu'il en prend 1 par defaut et peut etre changé


export default class MqttService {
  constructor(onMessage, topics = ["distributeur/cle"]) {
    this.ws = null;
    this.onMessage = onMessage;
    this.topics = Array.isArray(topics) ? topics : [topics];
    this.topic = this.topics[0];
  }

  connect() {
    this.ws = new WebSocket(process.env.EXPO_PUBLIC_MQTT_URL, ["mqtt"]);
    this.ws.binaryType = "arraybuffer";
    console.log("WS création, état:", this.ws.readyState);

    this.ws.onopen = () => {
      console.log("WS connecté !");
      const encoder = new TextEncoder();
      const clientId = "expo_sub_" + Math.random().toString(16).substr(2, 8);
      const clientIdBytes = encoder.encode(clientId);
      const usernameBytes = encoder.encode(process.env.EXPO_PUBLIC_MQTT_USERNAME);
      const passwordBytes = encoder.encode(process.env.EXPO_PUBLIC_MQTT_PASSWORD);

      const connectPacket = new Uint8Array([
        0x10, 0, // header fixe, length à corriger ensuite
        0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, // "MQTT"
        0x04, // version
        0xc2, // flags : username+password
        0x00, 0x3c, // keepalive 60s
        0x00, clientIdBytes.length, ...clientIdBytes,
        0x00, usernameBytes.length, ...usernameBytes,
        0x00, passwordBytes.length, ...passwordBytes,
      ]);

      connectPacket[1] = connectPacket.length - 2;
      this.ws.send(connectPacket.buffer);
    };


    this.ws.onmessage = (e) => {
      try {
        if (!(e.data instanceof ArrayBuffer)) {
          console.log("WS message ignoré (pas binaire):", e.data);
          return;
        }

        const data = new Uint8Array(e.data);
        console.log("WS message reçu, taille:", data.length);

        if (data[0] === 0x20 && data[3] === 0x00) {
          console.log("CONNACK reçu, abonnement en cours...");
          const encoder = new TextEncoder();
          const topic = encoder.encode(this.topic);

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

          if (this.onMessage) this.onMessage(message);
        }

      } catch (err) {
        console.log("WS PARSE ERROR:", err);
      }
    };

    this.ws.onerror = (e) => {
      console.log("WS ERREUR:", e?.message ?? e);
    };

    this.ws.onclose = () => {
      console.log("WS fermé → reconnexion dans 2s...");
      setTimeout(() => this.connect(), 2000);
    };
  }


  publish(messageText) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("WS pas prêt, abandon publish");
      return;
    }

    const encoder = new TextEncoder();
    const topic = encoder.encode(this.topic);
    const message = encoder.encode(messageText);
    const remainingLength = 2 + topic.length + message.length;

    const pubPacket = new Uint8Array([
      0x30,
      remainingLength,
      topic.length >> 8,
      topic.length & 0xff,
      ...topic,
      ...message,
    ]);

    this.ws.send(pubPacket.buffer);
    console.log("Message publié:", messageText);
  }

  // Déconnecter la WS
  disconnect() {
    if (this.ws) this.ws.close();
  }
}