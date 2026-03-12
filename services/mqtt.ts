export default class MqttService {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
  }

  connect() {
      //Connexion topic MQTT par chat gpt
      //Utilisation d'un web socket pour la connexion
    this.ws = new WebSocket("ws://138.68.23.149:9002/mqtt", ["mqtt"]);

    this.ws.onopen = () => {
      const encoder = new TextEncoder();
      const clientId = "expo_sub_" + Math.random().toString(16).substr(2, 8);
        //information de connexion au broker
      const clientIdBytes = encoder.encode(clientId);
      const usernameBytes = encoder.encode("apiuser");
      const passwordBytes = encoder.encode("ApiPass10!");
        //Paquet de connexion car mqtt fonctionne en binaire
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

    this.ws.onmessage = (e) => {
      const data = new Uint8Array(e.data);
        //Vérification que la connexion est établie
      if (data[0] === 0x20 && data[3] === 0x00) {
        const encoder = new TextEncoder();
        //Abonnement au topic
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
        // Affichage du message
      if ((data[0] & 0xf0) === 0x30) {
        const topicLength = (data[2] << 8) | data[3];
        const messageStart = 4 + topicLength;

        const decoder = new TextDecoder();
        const message = decoder.decode(data.slice(messageStart));

        if (this.onMessage) {
          this.onMessage(message);
        }
      }
    };
  }
    // Envoi d'un message MQTT
  publish(messageText) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

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
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}