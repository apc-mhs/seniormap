from flask import Flask, request, render_template, redirect, abort
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
# Suppress warnings
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404


@app.route("/")
def home():
    return render_template("index.html")


class School(db.Model):
    __tablename__ = "schools"
    slug = db.Column(db.String(16), unique=True, primary_key=True)
    name = db.Column(db.String(32), unique=True)
    form = db.Column(db.String(32), unique=True)
    sheet = db.Column(db.String(64), unique=True)
    background = db.Column(db.String(16))
    light_background = db.Column(db.String(16))
    lighter_background = db.Column(db.String(16))
    dark_background = db.Column(db.String(16))
    accent = db.Column(db.String(16))


@app.route("/<slug>")
def map(slug):
    school = School.query.get(slug)
    if school is None:
        abort(404)
    return render_template("map.html", school=school)
