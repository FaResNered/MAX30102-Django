/*
This code is an Arduino sketch designed to monitor various physiological
parameters like heart rate (BPM), oxygen saturation (SpO2), humidity,
and temperature using sensors such as MAX30102 (for pulse oximetry) and DHT11
(for temperature and humidity). Additionally, it includes functionality for
Heart Rate Variability (HRV) calculation.

Here's a breakdown of the main functionalities:
- Initialization: The setup function initializes the required pins, serial communication, sensors, and file system for writing data to an SD card.
- HRV Calculation: The code calculates Heart Rate Variability (HRV) based on the time intervals between successive heartbeats.
- Data Logging: The data collected from the sensors is logged onto an SD card in a CSV format, including BPM, SpO2, HRV, humidity, and temperature.
- Button Control: A push-button is used to toggle a buzzer on or off, likely for some form of user feedback or indication.
- Main Loop: In the loop function, the code continuously updates sensor readings, checks for button presses, calculates HRV, and logs data to the SD card at regular intervals.
*/

#include <Wire.h>
#include "MAX30102_PulseOximeter.h"
#include "DHT.h"
#include "FatFs_SD.h"
#include <string>

#define REPORTING_PERIOD_MS 1000
#define MAX30102_REG_FIFO_DATA 0x07

//PA12 = 9
#define DHTPIN 9
#define DHTTYPE DHT11
#define BUZZERPIN 10
#define MAX_BUFFER 65535

// PulseOximeter is the higher level interface to the sensor
// it offers:
//  * beat detection reporting
//  * heart rate calculation
//  * SpO2 (oxidation level) calculation 

PulseOximeter pox;
DHT dht(DHTPIN, DHTTYPE);
FatFsSD fs;
SdFatFile file;

uint32_t tsLastReport = 0;
uint16_t Tempo_battiti[100];
uint16_t last_beat = 0;
int i_HRV = 0;
bool buzzer_on = false;
bool btn_premuto = false;
int i_filename = 0;
char data[] = "data_";
char estensione[] = ".csv";
char filename[20];
char absolute_filename[128];
char buf[MAX_BUFFER];

void HRV_check(){
  if (buzzer_on){
    tone(BUZZERPIN, 500, 30);
  }

  if (last_beat != 0){
    Tempo_battiti[i_HRV] = millis() - last_beat;
    if (Tempo_battiti[i_HRV] < 1200){
      i_HRV++;
      if (i_HRV >= 100){
      
        for(int i = 10; i < 100; i++){
          Tempo_battiti[i-10] = Tempo_battiti[i];
        }
        for(int i = 90; i < 100; i++){
          Tempo_battiti[i] = 0;
        }

        i_HRV = 90;
      }
    }
  }
  last_beat = millis();
  
}

int getHRV(){
  uint RR = 0;
  for (int i = 1; i < i_HRV; i++){
    RR += pow(Tempo_battiti[i] - Tempo_battiti[i-1], 2);
  }
  return sqrt(RR/(i_HRV-1));
}

void sd_card_write(int BPM, int SpO2, int HRV, int Umidita, int Temperatura){
  file = fs.open(absolute_filename);

  memset(buf, 0, sizeof(buf));
  file.read(buf, sizeof(buf));

  while (strlen(buf) > MAX_BUFFER-100){
    i_filename++;
    sprintf(filename, "%s%d%s", data, i_filename, estensione);
    sprintf(absolute_filename, "%s%s", fs.getRootPath(), filename);
    file = fs.open(absolute_filename);
    memset(buf, 0, sizeof(buf));
    file.read(buf, sizeof(buf));
    Serial.print("File creato/aperto: ");
    Serial.println(filename);
  }

  if (strlen(buf) == 0){
    file.println("BPM;SpO2;HRV;Umidita;Temperatura");
  }

  file.print(BPM);
  file.print(";");
  file.print(SpO2);
  file.print(";");
  file.print(HRV);
  file.print(";");
  file.print(Umidita);
  file.print(";");
  file.print(Temperatura);
  file.println();
  file.close();
}

void setup()
{
  pinMode(BUZZERPIN, OUTPUT);
  pinMode(PUSH_BTN, INPUT);
  Serial.begin(115200);
  Serial.print("Initializing... ");
  delay(3000);
  
  // Initialize the PulseOximeter instance
  if (!pox.begin()) {
      Serial.println("FAILED");
      for(;;);
  } else {
      Serial.println("SUCCESS");
  }
  // The default current for the IR LED is 50mA and is changed below
  pox.setIRLedCurrent(MAX30102_LED_CURR_7_6MA);
  pox.setOnBeatDetectedCallback(HRV_check);
  dht.begin();
  
  fs.begin();

  sprintf(filename, "%s%d%s", data, i_filename, estensione);
  sprintf(absolute_filename, "%s%s", fs.getRootPath(), filename);
  memset(buf, 0, sizeof(buf));
  file.read(buf, sizeof(buf));

  while (strlen(buf) > 0){
    i_filename++;
    sprintf(filename, "%s%d%s", data, i_filename, estensione);
    sprintf(absolute_filename, "%s%s", fs.getRootPath(), filename);
    file = fs.open(absolute_filename);
    memset(buf, 0, sizeof(buf));
    file.read(buf, sizeof(buf));
    Serial.print("File creato/aperto: ");
    Serial.println(filename);
  }
}
 
void loop()
{
    // Make sure to call update as fast as possible
    pox.update();
    
    if (digitalRead(PUSH_BTN) & !btn_premuto){
      buzzer_on = !buzzer_on;
      btn_premuto = true;
    }
    else if (!digitalRead(PUSH_BTN) & btn_premuto){
      btn_premuto = false;
    }

    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
      bool Dito = pox.hrm.readRegister(MAX30102_REG_FIFO_DATA) > 0 ? true : false;
      int BPM = pox.getHeartRate();
      int SpO2 = pox.getSpO2() > 100 ? 100 : pox.getSpO2();
      Serial.print("{\"Finger\": ");
      Serial.print(Dito);
      Serial.print(", \"BPM\": ");
      Serial.print(BPM);
      Serial.print(", \"SpO2\": ");
      Serial.print(SpO2);
      
      float h = dht.readHumidity();
      float t = dht.readTemperature();
      float hic = dht.computeHeatIndex(t, h, false);
      Serial.print(", \"Humidity\": ");
      Serial.print(h);
      Serial.print(", \"Temperature\": ");
      Serial.print(t);
      Serial.print(F(", \"Heat_index\": "));
      Serial.print(hic);

      int HRV = getHRV();
      Serial.print(", \"HRV\": ");
      Serial.print(HRV);
      Serial.print(", \"i_HRV\": ");
      Serial.print(i_HRV);
      Serial.print("}");
      Serial.println();

      if (Dito)
        sd_card_write(BPM, SpO2, HRV, h, t);

      tsLastReport = millis();
    }

}


