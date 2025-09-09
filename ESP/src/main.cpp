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
const char* client_id = "ESP8266_NodeMCU";

// MQTT Topics for sensor data
const char* topic_bus_voltage = "microgrid/sensor/bus_voltage";
const char* topic_shunt_voltage = "microgrid/sensor/shunt_voltage";
const char* topic_load_voltage = "microgrid/sensor/load_voltage";
const char* topic_current = "microgrid/sensor/current";
const char* topic_power = "microgrid/sensor/power";
const char* topic_status = "microgrid/sensor/status";

// Sensor reading interval
const unsigned long sensor_interval = 5000; // 5 seconds in milliseconds

// Global variables
WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_INA219 ina219;
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
  Serial.println("=== ESP8266 Microgrid Sensor MQTT Publisher ===");
  Serial.println("Starting up...");

  // Initialize I2C for INA219 (SDA=GPIO4, SCL=GPIO5)
  Wire.begin(4, 5);
  
  // Initialize INA219 sensor
  if (!ina219.begin(&Wire)) {
    Serial.println("Failed to find INA219 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("INA219 sensor initialized successfully!");

  // Setup WiFi connection
  setup_wifi();

  // Configure MQTT client
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.print("MQTT broker configured: ");
  Serial.print(mqtt_server);
  Serial.print(":");
  Serial.println(mqtt_port);
  Serial.println("MQTT Topics configured:");
  Serial.print("  Bus Voltage: ");
  Serial.println(topic_bus_voltage);
  Serial.print("  Shunt Voltage: ");
  Serial.println(topic_shunt_voltage);
  Serial.print("  Load Voltage: ");
  Serial.println(topic_load_voltage);
  Serial.print("  Current: ");
  Serial.println(topic_current);
  Serial.print("  Power: ");
  Serial.println(topic_power);
  Serial.print("  Status: ");
  Serial.println(topic_status);
  Serial.print("Sensor reading interval: ");
  Serial.print(sensor_interval / 1000);
  Serial.println(" seconds");
  Serial.println("Setup complete!");
  Serial.println("===================================================");
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

  // Read sensor data and publish every 5 seconds
  unsigned long now = millis();
  if (now - lastMsg > sensor_interval) {
    lastMsg = now;
    
    // Read sensor values
    float shuntvoltage = ina219.getShuntVoltage_mV();
    float busvoltage   = ina219.getBusVoltage_V();
    float current_mA   = ina219.getCurrent_mA();
    float power_mW     = ina219.getPower_mW();
    float loadvoltage  = busvoltage + (shuntvoltage / 1000);
    
    // Print sensor readings to serial
    Serial.println("=== Sensor Readings ===");
    Serial.print("Bus Voltage:   "); Serial.print(busvoltage); Serial.println(" V");
    Serial.print("Shunt Voltage: "); Serial.print(shuntvoltage); Serial.println(" mV");
    Serial.print("Load Voltage:  "); Serial.print(loadvoltage); Serial.println(" V");
    Serial.print("Current:       "); Serial.print(current_mA); Serial.println(" mA");
    Serial.print("Power:         "); Serial.print(power_mW); Serial.println(" mW");
    
    // Convert readings to strings for MQTT publishing
    char busVoltageStr[10], shuntVoltageStr[10], loadVoltageStr[10];
    char currentStr[10], powerStr[10];
    
    dtostrf(busvoltage, 6, 3, busVoltageStr);
    dtostrf(shuntvoltage, 6, 3, shuntVoltageStr);
    dtostrf(loadvoltage, 6, 3, loadVoltageStr);
    dtostrf(current_mA, 6, 3, currentStr);
    dtostrf(power_mW, 6, 3, powerStr);
    
    // Publish sensor data to MQTT topics
    Serial.println("Publishing sensor data to MQTT...");
    
    bool allPublished = true;
    
    if (!client.publish(topic_bus_voltage, busVoltageStr)) {
      Serial.println("Failed to publish bus voltage!");
      allPublished = false;
    }
    
    if (!client.publish(topic_shunt_voltage, shuntVoltageStr)) {
      Serial.println("Failed to publish shunt voltage!");
      allPublished = false;
    }
    
    if (!client.publish(topic_load_voltage, loadVoltageStr)) {
      Serial.println("Failed to publish load voltage!");
      allPublished = false;
    }
    
    if (!client.publish(topic_current, currentStr)) {
      Serial.println("Failed to publish current!");
      allPublished = false;
    }
    
    if (!client.publish(topic_power, powerStr)) {
      Serial.println("Failed to publish power!");
      allPublished = false;
    }
    
    // Publish status message
    const char* statusMsg = allPublished ? "online" : "error";
    client.publish(topic_status, statusMsg);
    
    if (allPublished) {
      Serial.println("All sensor data published successfully!");
    } else {
      Serial.println("Some sensor data failed to publish!");
    }
    
    Serial.print("Next reading in ");
    Serial.print(sensor_interval / 1000);
    Serial.println(" seconds");
    Serial.println("========================");
  }
}
