#include <Arduino.h>
#include <Adafruit_INA219.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Replace the next variables with your SSID/Password combination
const char* ssid = "DakshNET 2.4";
const char* password = "9650349609";

// Add your MQTT Broker IP address
const char* mqtt_server = "192.168.0.105";

// INA219 sensor instance
Adafruit_INA219 ina219;

// WiFi and MQTT client objects
WiFiClient espClient;
PubSubClient client(espClient);

// Timing
long lastMsg = 0;
char msg[200];
int value = 0;

// Sensor readings
float current_mA = 0;
float power_mW = 0;
float busvoltage = 0;
 
void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();
  
  // Add any control logic here if needed in the future
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("NodeMCU_Node1_Zone1")) {
      Serial.println("connected");
      // Subscribe to control topics if needed
      // client.subscribe("/node1/zone1/control");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // Initialize the INA219 sensor
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1) {
      delay(10);
    }
  }
  
  Serial.println("INA219 sensor initialized - Node1/Zone1 ready");
  
  // Setup WiFi and MQTT
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}
 
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 5000) {  // Publish every 5 seconds
    lastMsg = now;
    
    // Read INA219 sensor values
    current_mA = ina219.getCurrent_mA();
    power_mW = ina219.getPower_mW();
    busvoltage = ina219.getBusVoltage_V();
    
    // Create JSON payload
    DynamicJsonDocument doc(256);
    doc["node_id"] = "node1";
    doc["zone_id"] = "zone1";
    doc["timestamp"] = now;
    doc["current_mA"] = current_mA;
    doc["voltage_V"] = busvoltage;
    doc["power_mW"] = power_mW;
    
    // Serialize JSON to string
    serializeJson(doc, msg);
    
    // Publish JSON to MQTT
    client.publish("/node1/zone1", msg);
    
    // Debug output
    Serial.print("Published JSON: ");
    Serial.println(msg);
    Serial.print("Current: ");
    Serial.print(current_mA);
    Serial.println(" mA");
    Serial.print("Voltage: ");
    Serial.print(busvoltage);
    Serial.println(" V");
    Serial.print("Power: ");
    Serial.print(power_mW);
    Serial.println(" mW");
    Serial.println();
  }
}