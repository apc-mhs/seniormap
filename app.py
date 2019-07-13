from flask import Flask, request, render_template, redirect
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
# Suppress warnings
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/<slug>")
def map(slug):

    return render_template("map.html")
