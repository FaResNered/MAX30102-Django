# MAX30102-Django

This is a Django project that was developed for a PCTO (Percorsi per le Competenze Trasversali e l'Orientamento) job. The project includes functionality for user authentication, sensor data collection and storage, and historical data retrieval. It utilizes a Realtek AMB23 board as the hardware platform, along with the MAX30102 and DHT11 sensors. The project uses a SQLite3 database to store user information with encrypted passwords and sensor measurements.

## Features

- User authentication with email, username and password (passwords are encrypted)
- Sensor data collection from MAX30102 (BPM, SpO2, HRV) and DHT11 (Temperature, Humidity)
- Storing sensor data in a SQLite3 database with timestamp and user association
- Retrieving historical sensor data based on date range

## Hardware Components

- **Realtek AMB23 Board**: The project is designed to work with the Realtek AMB23 board, which is a compact, low-power embedded platform suitable for IoT applications.
- **MAX30102**: A pulse oximetry and heart rate sensor used to measure BPM, SpO2, and HRV.
- **DHT11**: A temperature and humidity sensor.

## Database

The project uses a SQLite3 database to store user information and sensor measurements. The following models are defined:

- **User model**

  - Extends AbstractBaseUser class
  - Includes fields for Username, Name, Email, TOKEN_RESET, and TIME_REQUEST_RESET
  - Passwords are encrypted using Django's built-in make_password function
- **Sensor model**

  - Includes fields for BPM, SpO2, HRV, Temperature, Humidity, HeatIndex, Time, and CodUser (foreign key to User model)

## URLs

The project defines the following URL patterns:

- ^link-password/.\*/.\*\/$ maps to views.link_password
- ^forgot-password/.*/$ maps to views.forgot_password
- measure/ maps to views.measure
- ^sign-page/[A-Za-z]*$ maps to views.sign
- main-page/ maps to views.redirect_main_page
- main-page/home/ maps to views.home_page
- main-page/history/ maps to views.history_page
- main-page/health/ maps to views.health_page
- ^history/.*/$ maps to views.history
- "" (empty URL) maps to views.emptyURL

## Views

The project defines the following Django views:

- **forgot_password**: Handles the forgot password functionality, generating a reset token and sending an email to the user.
- **measure**: Collects sensor data from the Realtek AMB23 board, specifically the MAX30102 and DHT11 sensors, and saves it to the SQLite3 database.
- **history**: Retrieves historical sensor data based on a date range specified in the URL.
- **link_password**: Handles the password reset process, allowing the user to set a new password.

## Installation and Setup

Clone the repository:

```
git clone https://github.com/your-username/django-pcto-project.git
```

Create a virtual environment and activate it:

```
python -m venv env
source env/bin/activate
```

Install the required dependencies:

```
pip install -r requirements.txt
```

Apply the database migrations:

```
python manage.py migrate
```

Start the development server:

```
python manage.py runserver
```

Access the application at http://127.0.0.1:8000/app/.

## Deployment

To deploy the application, you can use a production-ready web server like Gunicorn or uWSGI, along with a reverse proxy like Nginx. Refer to the Django deployment documentation for more information.

## Contribution

If you would like to contribute to this project, please follow the standard GitHub contribution guidelines.

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
