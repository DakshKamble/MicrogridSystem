import paho.mqtt.client as mqtt

BROKER = "localhost"   # same as ESP code
PORT = 1883
TOPIC = "microgrid/#"     # subscribe to all your ESP’s topics

def on_connect(client, userdata, flags, rc, properties=None):
    print("Connected with result code " + str(rc))
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    print(f"Topic: {msg.topic} | Message: {msg.payload.decode()}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_forever()
