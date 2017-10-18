import sys
import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)

# Initialize pin as input
pin = int(sys.argv[1])
GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
	# Print the value read from the pin
	print(GPIO.input(pin))
	time.sleep(0.005)

