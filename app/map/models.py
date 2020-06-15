from app.exts import db


class School(db.Model):
    __tablename__ = 'schools'
    slug = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)
    form = db.Column(db.String(32), unique=True, nullable=False)
    sheet = db.Column(db.String(64), unique=True, nullable=False)
    background = db.Column(db.String(16))
    light_background = db.Column(db.String(16))
    lighter_background = db.Column(db.String(16))
    dark_background = db.Column(db.String(16))
    accent = db.Column(db.String(16))
