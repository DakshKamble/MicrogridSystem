#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// WiFi credentials - Update these with your network details
const char* ssid = "Daksh";
const char* password = "9650349609";

// MQTT broker settings - Update with your Raspberry Pi IP
const char* mqtt_server = "10.237.57.155";  // Replace with your Raspberry Pi IP
const int mqtt_port = 1883;
const char* mqtt_topic = "test/topic";
const char* client_id = "ESP8266_NodeMCU";

// Message settings
const char* message = "Hello from NodeMCU";
const unsigned long publish_interval = 5000; // 5 seconds in milliseconds

// Global variables
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi network: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected successfully!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal strength (RSSI): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

void reconnect_mqtt() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Attempt to connect
    if (client.connect(client_id)) {
      Serial.println(" connected!");
      Serial.print("Connected to MQTT broker at: ");
      Serial.print(mqtt_server);
      Serial.print(":");
      Serial.println(mqtt_port);
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== ESP8266 MQTT Publisher ===");
  Serial.println("Starting up...");

  // Setup WiFi connection
  setup_wifi();

  // Configure MQTT client
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.print("MQTT broker configured: ");
  Serial.print(mqtt_server);
  Serial.print(":");
  Serial.println(mqtt_port);
  Serial.print("Publishing to topic: ");
  Serial.println(mqtt_topic);
  Serial.print("Message: ");
  Serial.println(message);
  Serial.print("Publish interval: ");
  Serial.print(publish_interval / 1000);
  Serial.println(" seconds");
  Serial.println("Setup complete!");
  Serial.println("========================");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost! Reconnecting...");
    setup_wifi();
  }

  // Check MQTT connection
  if (!client.connected()) {
    Serial.println("MQTT connection lost! Reconnecting...");
    reconnect_mqtt();
  }

  // Maintain MQTT connection
  client.loop();

  // Publish message every 5 seconds
  unsigned long now = millis();
  if (now - lastMsg > publish_interval) {
    lastMsg = now;
    
    Serial.print("Publishing message: ");
    Serial.print(message);
    Serial.print(" to topic: ");
    Serial.println(mqtt_topic);
    
    if (client.publish(mqtt_topic, message)) {
      Serial.println("Message published successfully!");
    } else {
      Serial.println("Failed to publish message!");
    }
    
    Serial.print("Next message in ");
    Serial.print(publish_interval / 1000);
    Serial.println(" seconds");
    Serial.println("---");
  }
}
