from flask import Flask, request, render_template, redirect


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/<slug>")
def map(slug):

    return render_template("map.html")
