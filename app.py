import os
from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for

TEMPLATE_DIR = os.path.abspath('templates')
STATIC_DIR = os.path.abspath('static')
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='/static')
app = Flask(__name__) # create instance of Flask

# Main page route
@app.route('/')
def form():
	return send_file('templates/index.html')

if __name__ == '__main__':
	app.run()