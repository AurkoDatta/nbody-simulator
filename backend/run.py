"""Entry point for running the Flask development server directly."""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(port=5000, debug=(app.config['FLASK_ENV'] == 'development'))
