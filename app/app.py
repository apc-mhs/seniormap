import os

from flask import Flask, abort, redirect, render_template, request
from flask_sqlalchemy import SQLAlchemy

from app import map as map_bp, main
from app.exts import db, migrate
from config import Config


def create_app(config_name=Config):
    app = Flask(__name__)
    app.config.from_object(config_name)

    register_blueprints(app)
    register_extensions(app)
    register_errorhandlers(app)

    app.shell_context_processor(lambda: {
        'db': db, 
        'School': map_bp.models.School
    })

    return app


def register_extensions(app):
    db.init_app(app)
    migrate.init_app(app)


def register_blueprints(app):
    app.register_blueprint(main.views.bp)
    app.register_blueprint(map_bp.views.bp)


def register_errorhandlers(app):
    app.register_error_handler(404, lambda error: (render_template('404.html'), 404))
