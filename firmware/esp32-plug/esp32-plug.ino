// KSV — ESP32 plug/light សាមញ្ញ (ទទួល POST /command)
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "ឈ្មោះ-WIFI";
const char* WIFI_PASS = "ពាក្យសម្ងាត់";
const char* DEVICE_ID = "plug-http-1";
const char* GATEWAY   = "http://192.168.1.10:4000/api/ksv"; // កែតាមជំហាន ៣
const char* TOKEN     = "";                                  // ទុកទទេ បើគ្មាន token
const int   RELAY_PIN = 2;                                   // GPIO ដែលភ្ជាប់ relay/LED

WebServer server(80);
bool power = false;

void apply() { digitalWrite(RELAY_PIN, power ? HIGH : LOW); }

void report() {
  HTTPClient h;
  h.begin(String(GATEWAY) + "/devices/" + DEVICE_ID + "/state");
  h.addHeader("Content-Type", "application/json");
  if (strlen(TOKEN)) h.addHeader("Authorization", String("Bearer ") + TOKEN);
  h.POST(String("{\"power\":") + (power ? "true" : "false") + "}");
  h.end();
}

void onCommand() {
  String b = server.arg("plain");
  if (b.indexOf("\"ON\"") >= 0) power = true;
  else if (b.indexOf("\"OFF\"") >= 0) power = false;
  else if (b.indexOf("\"TOGGLE\"") >= 0) power = !power;
  else if (b.indexOf("\"GET_STATUS\"") < 0) {
    server.send(400, "application/json", "{\"ok\":false}");
    return;
  }
  apply();
  server.send(200, "application/json", String("{\"ok\":true,\"power\":") + (power ? "true" : "false") + "}");
  report();
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  apply();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  server.on("/command", HTTP_POST, onCommand);
  server.begin();
}

void loop() { server.handleClient(); }
