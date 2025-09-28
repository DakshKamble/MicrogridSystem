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

// INA219 sensor instances for three zones
Adafruit_INA219 ina219_zone1(0x40);  // Default address (A0=GND, A1=GND)
Adafruit_INA219 ina219_zone2(0x41);  // A0=VDD, A1=GND
Adafruit_INA219 ina219_zone3(0x44);  // A0=GND, A1=VDD

// WiFi and MQTT client objects
WiFiClient espClient;
PubSubClient client(espClient);

// Timing
long lastMsg = 0;
char msg[200];
int value = 0;

// Sensor readings for all three zones
struct ZoneReadings {
  float current_mA;
  float power_mW;
  float busvoltage;
};

ZoneReadings zone1_readings = {0, 0, 0};
ZoneReadings zone2_readings = {0, 0, 0};
ZoneReadings zone3_readings = {0, 0, 0};
 
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
  
  // Initialize all three INA219 sensors
  if (!ina219_zone1.begin()) {
    Serial.println("Failed to find INA219 chip for Zone 1 (0x40)");
    while (1) {
      delay(10);
    }
  }
  
  if (!ina219_zone2.begin()) {
    Serial.println("Failed to find INA219 chip for Zone 2 (0x41)");
    while (1) {
      delay(10);
    }
  }
  
  if (!ina219_zone3.begin()) {
    Serial.println("Failed to find INA219 chip for Zone 3 (0x44)");
    while (1) {
      delay(10);
    }
  }
  
  Serial.println("All INA219 sensors initialized - Node1 with 3 zones ready");
  
  // Setup WiFi and MQTT
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}
 
void publishZoneData(const char* zone_id, const char* topic, ZoneReadings& readings, long timestamp) {
  // Create JSON payload for the zone
  DynamicJsonDocument doc(256);
  doc["node_id"] = "node1";
  doc["zone_id"] = zone_id;
  doc["timestamp"] = timestamp;
  doc["current_mA"] = readings.current_mA;
  doc["voltage_V"] = readings.busvoltage;
  doc["power_mW"] = readings.power_mW;
  
  // Serialize JSON to string
  serializeJson(doc, msg);
  
  // Publish JSON to MQTT
  client.publish(topic, msg);
  
  // Debug output
  Serial.print("Published ");
  Serial.print(zone_id);
  Serial.print(" JSON: ");
  Serial.println(msg);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 5000) {  // Publish every 5 seconds
    lastMsg = now;
    
    // Read all INA219 sensor values
    zone1_readings.current_mA = ina219_zone1.getCurrent_mA();
    zone1_readings.power_mW = ina219_zone1.getPower_mW();
    zone1_readings.busvoltage = ina219_zone1.getBusVoltage_V();
    
    zone2_readings.current_mA = ina219_zone2.getCurrent_mA();
    zone2_readings.power_mW = ina219_zone2.getPower_mW();
    zone2_readings.busvoltage = ina219_zone2.getBusVoltage_V();
    
    zone3_readings.current_mA = ina219_zone3.getCurrent_mA();
    zone3_readings.power_mW = ina219_zone3.getPower_mW();
    zone3_readings.busvoltage = ina219_zone3.getBusVoltage_V();
    
    // Publish data for all three zones
    publishZoneData("zone1", "/node1/zone1", zone1_readings, now);
    publishZoneData("zone2", "/node1/zone2", zone2_readings, now);
    publishZoneData("zone3", "/node1/zone3", zone3_readings, now);
    
    // Debug output summary
    Serial.println("=== Zone Readings Summary ===");
    Serial.print("Zone1 - Current: ");
    Serial.print(zone1_readings.current_mA);
    Serial.print(" mA, Voltage: ");
    Serial.print(zone1_readings.busvoltage);
    Serial.print(" V, Power: ");
    Serial.print(zone1_readings.power_mW);
    Serial.println(" mW");
    
    Serial.print("Zone2 - Current: ");
    Serial.print(zone2_readings.current_mA);
    Serial.print(" mA, Voltage: ");
    Serial.print(zone2_readings.busvoltage);
    Serial.print(" V, Power: ");
    Serial.print(zone2_readings.power_mW);
    Serial.println(" mW");
    
    Serial.print("Zone3 - Current: ");
    Serial.print(zone3_readings.current_mA);
    Serial.print(" mA, Voltage: ");
    Serial.print(zone3_readings.busvoltage);
    Serial.print(" V, Power: ");
    Serial.print(zone3_readings.power_mW);
    Serial.println(" mW");
    Serial.println("=============================");
    Serial.println();
  }
}