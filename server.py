#!/usr/bin/env python2.7

"""
Example Webserver

To run locally:

    python server.py

To run with debug mode:

    python server.py --debug

Go to http://localhost:8080 in your browser.

A debugger such as "pdb" may be helpful for debugging.
Read about it online.
"""
import os
from datetime import datetime
from flask import Flask
from flask import g
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import Response
from flask.ext.pymongo import PyMongo

from sqlalchemy import *
from sqlalchemy.pool import NullPool
from SketchLib.SketchRecogniser import sketch_recogniser

from SketchLib.PictureLib import picture_matcher
from SketchLib.PictureLib import save_to_png


app = Flask(__name__)
app.config["MONGO_DBNAME"] = "vdb_images"
app.config["MONGO_USERNAME"] = "JRK"
app.config["MONGO_PASSWORD"] = "weloveVDB"

mongo = PyMongo(app)

output_sketch = "static/img/sketch.png"
# output_sketch = "static/img/sketch"
copied_sketch = "static/img/copied.png"

picture_results = []

@app.route('/')
def index():
    """
    request is a special object that Flask provides to access web request information:

    request.method:   "GET" or "POST"
    request.form:     if the browser submitted a form, this contains the data in the form
    request.args:     dictionary of URL arguments, e.g., {a:1, b:2} for http://localhost?a=1&b=2

    See its API: http://flask.pocoo.org/docs/0.10/api/#incoming-request-data
    """

    return render_template("index.html")


# def save_to_png(base64_str, file_name):
#     f = open(file_name, 'w')
#     f.write(base64_str.decode("base64"))
#     f.close()

@app.route("/get_sketches", methods=["POST", "GET"])
def get_sketches():
    if request.method == "GET":
        return redirect("/")
    else:
        sketch_binary_str = request.form["sketch"]
        fname = output_sketch
        save_to_png(sketch_binary_str, fname)
        results = sketch_recogniser(fname)
        return jsonify({"sketches": results})

@app.route("/get_pictures", methods=["POST"])
def get_pictures():
    
    sketch_tag = request.form.get('tag', None)
    sketch_pic_base64 = request.form.get('sketch_pic', "")
    page_idx = int(request.form.get('page', 0))
    sketch_file_path = request.form.get('sketch_filepath', "")

    if sketch_tag is None:
        sketch_file_path = copied_sketch
    else:
        sketch_file_path = sketch_file_path.replace("http://45.79.141.71:8080/", "")
    global picture_results
    picture_results = picture_matcher(mongo, sketch_tag, sketch_pic_base64, sketch_file_path)
    return jsonify({"pictures": picture_results[page_idx:page_idx + 20]})

@app.route("/search_by_potential_sketches", methods=["POST", "GET"])
def search_by_potential_sketches():
    if request.method == "GET":
        return picture_matcher(mongo)
    else:
        return picture_matcher(mongo)

if __name__ == "__main__":
    import click

    @click.command()
    @click.option('--debug', is_flag=True)
    @click.option('--threaded', is_flag=True)
    @click.argument('HOST', default='0.0.0.0')
    @click.argument('PORT', default=8080, type=int)
    def run(debug, threaded, host, port):
        """
        This function handles command line parameters.
        Run the server using:

            python server.py

        Show the help text using:

            python server.py --help

        """
        HOST, PORT = host, port
        print "running on %s:%d" % (HOST, PORT)
        app.run(host=HOST, port=PORT, debug=debug, threaded=threaded)   

    run()
