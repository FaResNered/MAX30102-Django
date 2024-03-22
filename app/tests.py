from django.test import TestCase
from serial.tools.list_ports import comports

if not None:
  ports = list(comports())
  for port in ports:
    if "Serial Port" in port.description:
      print(port)