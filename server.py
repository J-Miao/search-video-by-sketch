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

app = Flask(__name__)
app.config["MONGO_DBNAME"] = "vdb"
mongo = PyMongo(app)

output_sketch = "static/img/sketch.png"

# @app.before_request
# def before_request():
#     """
#     This function is run at the beginning of every web request 
#     (every time you enter an address in the web browser).
#     We use it to setup a database connection that can be used throughout the request.

#     The variable g is globally accessible.
#     """
#     try:
#         g.conn = engine.connect()
#     except:
#         print "uh oh, problem connecting to database"
#         import traceback; traceback.print_exc()
#         g.conn = None

# @app.teardown_request
# def teardown_request(exception):
#     """
#     At the end of the web request, this makes sure to close the database connection.
#     If you don't, the database could run out of memory!
#     """
#     try:
#         g.conn.close()
#     except Exception as e:
#         pass

#
# @app.route is a decorator around index() that means:
#   run index() whenever the user tries to access the "/" path using a GET request
#
# If you wanted the user to go to, for example, localhost:8111/foobar/ with POST or GET then you could use:
#
#       @app.route("/foobar/", methods=["POST", "GET"])
#
# PROTIP: (the trailing / in the path is important)
# 
# see for routing: http://flask.pocoo.org/docs/0.10/quickstart/#routing
# see for decorators: http://simeonfranklin.com/blog/2012/jul/1/python-decorators-in-12-steps/
#

@app.route('/')
def index():
    """
    request is a special object that Flask provides to access web request information:

    request.method:   "GET" or "POST"
    request.form:     if the browser submitted a form, this contains the data in the form
    request.args:     dictionary of URL arguments, e.g., {a:1, b:2} for http://localhost?a=1&b=2

    See its API: http://flask.pocoo.org/docs/0.10/api/#incoming-request-data
    """

    # DEBUG: this is debugging code to see what request looks like
    # print request.args

    #
    # example of a database query
    #
    # cursor = g.conn.execute("SELECT Name FROM Person")
    # names = []
    # for result in cursor:
    #   names.append(result['name'])  # can also be accessed using result[0]
    # cursor.close()

    #
    # Flask uses Jinja templates, which is an extension to HTML where you can
    # pass data to a template and dynamically generate HTML based on the data
    # (you can think of it as simple PHP)
    # documentation: https://realpython.com/blog/python/primer-on-jinja-templating/
    #
    # You can see an example template in templates/index.html
    #
    # context are the variables that are passed to the template.
    # for example, "data" key in the context variable defined below will be 
    # accessible as a variable in index.html:
    #
    #     # will print: [u'grace hopper', u'alan turing', u'ada lovelace']
    #     <div>{{data}}</div>
    #     
    #     # creates a <div> tag for each element in data
    #     # will print: 
    #     #
    #     #   <div>grace hopper</div>
    #     #   <div>alan turing</div>
    #     #   <div>ada lovelace</div>
    #     #
    #     {% for n in data %}
    #     <div>{{n}}</div>
    #     {% endfor %}
    #
    # context = dict(data = names)


    #
    # render_template looks in the templates/ folder for files.
    # for example, the below file reads template/index.html
    #
    return render_template("index.html")

def save_to_png(binary_str):
    f = open(output_sketch, "w")
    f.write(binary_str.decode("base64"))
    f.close()

@app.route("/get_sketches", methods=["POST", "GET"])
def get_sketches():
    if request.method == "GET":
        print "get_sketches"
        return redirect("/")
    else:
        sketch_binary_str = request.form["sketch"]
        print sketch_binary_str
        save_to_png(sketch_binary_str)
        similarity_picpath_tuples = sketch_recogniser(output_sketch)
        return render_template("sketch.html", result_tuples=similarity_picpath_tuples)

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
    @click.argument('HOST', default='127.0.0.1')
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
