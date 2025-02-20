#include <TinyGPS++.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Your API endpoints
const char* serverUrl = "YOUR_SERVER_URL/data";
const char* commandUrl = "YOUR_SERVER_URL/command";

// GPS Module pins
static const int RXPin = 16, TXPin = 17;
static const uint32_t GPSBaud = 9600;

// The TinyGPS++ object
TinyGPSPlus gps;

// Pins for various controls
const int motionPin = 2;
const int engineLockPin = 4;
const int parkingSensorPin = 5;

// Variables for vehicle status
bool isMoving = false;
bool isEngineLocked = false;
bool isAutoParking = false;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  
  // Initialize GPS
  Serial2.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);
  
  // Initialize pins
  pinMode(motionPin, INPUT);
  pinMode(engineLockPin, OUTPUT);
  pinMode(parkingSensorPin, INPUT);
}

void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<200> doc;
    
    if (gps.location.isValid()) {
      doc["latitude"] = gps.location.lat();
      doc["longitude"] = gps.location.lng();
    } else {
      doc["gps_status"] = "No Fix";
    }
    
    doc["motion_status"] = isMoving ? "Moving" : "Stationary";
    doc["camera_status"] = "Active";
    doc["engine_locked"] = isEngineLocked;
    doc["auto_parking"] = isAutoParking;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
}

void checkForCommands() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(commandUrl);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (!error) {
        const char* command = doc["command"];
        
        if (strcmp(command, "LOCK_ENGINE") == 0) {
          lockEngine();
        } else if (strcmp(command, "AUTO_PARK") == 0) {
          startAutoParking();
        }
      }
    }
    
    http.end();
  }
}

void lockEngine() {
  digitalWrite(engineLockPin, HIGH);
  isEngineLocked = true;
  Serial.println("Engine locked");
}

void startAutoParking() {
  isAutoParking = true;
  Serial.println("Auto parking initiated");
  // Add your auto parking logic here
  // This would involve reading parking sensors and controlling the vehicle
}

void loop() {
  // Read GPS data
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }
  
  // Check motion status
  isMoving = digitalRead(motionPin) == HIGH;
  
  // Send data to server
  sendDataToServer();
  
  // Check for new commands
  checkForCommands();
  
  // If auto parking is active, run parking routine
  if (isAutoParking) {
    // Add your parking routine logic here
    if (digitalRead(parkingSensorPin) == LOW) {
      isAutoParking = false;
      Serial.println("Parking completed");
    }
  }
  
  delay(1000); // Update every second
}