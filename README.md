py -m venv venv
venv\Scripts\Activate.ps1

pip install flask flask-sqlalchemy
pip install flask-jwt-extended 
pip install python-dotenv
pip install bcrypt==4.0.1
pip install marshmallow flask-marshmallow
pip freeze > requirements.txt

git add .
git commit -m "Initial commit" 
git remote add origin https://github.com/GANYO1/Expense-Tracker.git
git branch -M main
git push -u origin main

rm -r venv


Order to build
.root setup
    create the folder structure
    create the run.py
App Factory(app/__init__.py)
    app/config.py
Models
Routes(Blueprints)
Run & Test

create_app()
it is a factory function - a function that creates and configures a new Flask app instance every time it is called
creates a new Flask app instance meaning -
configures a new Flask app instance meaning -
flask app instance meaning - 