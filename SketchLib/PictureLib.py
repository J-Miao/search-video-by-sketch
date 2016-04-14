from flask import jsonify

def picture_matcher(mongo, sketch_tag, page_idx=0):
    call_back = mongo.db.vdb_images.find()
    results = []
    for document in call_back:
    	if sketch_tag in document['tags']:
        	results.append({'pic': document['base64']})
    return results