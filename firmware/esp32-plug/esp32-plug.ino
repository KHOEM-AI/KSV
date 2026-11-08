// KSV — ESP32 plug/light សាមញ្ញ
// gateway ហៅមក POST /command ({"command":"ON|OFF|TOGGLE|GET_STATUS"})
// ឧបករណ៍ឆ្លើយ {"ok":true,"state":{"power":true|false}} ហើយ gateway កត់ state ពីចម្លើយ
// មិនមាន token ឬការហៅចេញទៅ gateway ទេ។
#include <WiFi.h>
#include <WebServer.h>
#include "secrets.h"   // WIFI_SSID, WIFI_PASS (មើល secrets.h.example)

const int RELAY_PIN = 2;          // GPIO ដែលភ្ជាប់ LED/relay
const bool ACTIVE_LOW = false;    // relay module ខ្លះបើកពេល LOW

WebServer server(80);
bool power = false;

void apply() {
  bool level = ACTIVE_LOW ? !power : power;
  digitalWrite(RELAY_PIN, level ? HIGH : LOW);
}

String stateJson() {
  return String("{\"ok\":true,\"state\":{\"power\":") + (power ? "true" : "false") + "}}";
}

void onCommand() {
  String b = server.arg("plain");
  if (b.indexOf("\"ON\"") >= 0) power = true;
  else if (b.indexOf("\"OFF\"") >= 0) power = false;
  else if (b.indexOf("\"TOGGLE\"") >= 0) power = !power;
  else if (b.indexOf("\"GET_STATUS\"") < 0) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"unknown command\"}");
    return;
  }
  apply();
  server.send(200, "application/json", stateJson());
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  apply();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  server.on("/command", HTTP_POST, onCommand);
  server.begin();
}

void loop() {
  server.handleClient();
  if (WiFi.status() != WL_CONNECTED) {   // ភ្ជាប់ WiFi វិញបើដាច់
    WiFi.reconnect();
    delay(1000);
  }
}
