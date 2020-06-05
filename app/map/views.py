from flask import Blueprint, render_template, abort

from .models import School


bp = Blueprint('map', __name__, url_prefix='/map', template_folder='../templates/map',
               static_folder='../static')


@bp.route('/map/<slug>')
def map(slug):
    school = School.query.get(slug)
    if school is None:
        abort(404)
    return render_template('map.html', school=school)
