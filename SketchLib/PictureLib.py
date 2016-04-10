from flask import jsonify

def picture_matcher(mongo):
    call_back = mongo.db.sketch.find()
    result = []
    for document in call_back:
        result.append({'id': document['id'], 'name': document['name'], 'img_url': document['img_url']})
    return jsonify({"pictures": result})
