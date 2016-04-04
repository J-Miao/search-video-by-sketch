from flask import jsonify
# from flask.ext.pymongo import PyMongo

# mongo = PyMongo(MONGO_DBNAME="app")

def sketch_recogniser():
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

def picture_matcher(mongo):
    call_back = mongo.db.sketch.find()
    result = []
    for document in call_back:
        result.append({'id': document['id'], 'name': document['name'], 'img_url': document['img_url']})
    return jsonify({"pictures": result})

