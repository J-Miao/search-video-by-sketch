import subprocess
from flask import jsonify
# from flask.ext.pymongo import PyMongo

# mongo = PyMongo(MONGO_DBNAME="app")

def sketch_recogniser_test():
    '''
    For autocompletion
    input parameters: sketch image
    call back: potential sketches 
    '''
    ants = [
                {
                    'id': 1,
                    'name': u'Ant1',
                    'img_url': 'http://www.yedraw.com/animals/drawing-ant-5.jpg'
                },
                {
                    'id': 2,
                    'name': u'Ant2',
                    'img_url': 'https://www.wpclipart.com/animals/bugs/ant/ants_2/ant_sketch.png'
                }
            ]
    return jsonify({"sketches": ants})

def sketch_recogniser(filename):
    args = ("./static/sketch-recognizer/build/tools/bin/sketch_search", filename)
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    output = popen.stdout.read()
    return [tuple(similarity_picpath_str.strip().split(' ')) for similarity_picpath_str in output.split('\n')]


