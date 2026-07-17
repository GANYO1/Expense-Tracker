py -m venv venv
venv\Scripts\Activate.ps1
git init 
git add .
pip install flask flask-sqlalchemy
pip install flask-jwt-extended 
pip install python-dotenv
pip install bcrypt==4.0.1
pip freeze > requirements.txt