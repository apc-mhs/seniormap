from flask import Blueprint, render_template


bp = Blueprint('main', __name__, url_prefix='/', template_folder='../templates',
               static_folder='../static')


@bp.route('/')
def home():
    return render_template('index.html')
