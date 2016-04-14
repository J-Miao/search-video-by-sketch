from flask import jsonify
from image_match.goldberg import ImageSignature

import numpy as np

gis = ImageSignature()
user_sketch_image = "../static/img/user_sketch_img.png"
user_signature = None

def save_to_png(base64_str, file_name):
    f = open(file_name, 'w')
    f.write(base64_str.decode("base64"))
    f.close()
    return file_name

def compare(result_dict):
	return gis.normalized_distance(result_dict['signature'], user_signature)

def picture_matcher(mongo, sketch_tag, user_sketch_pic_base64, page_idx=0):
    call_back = mongo.db.vdb_images.find()
    results = []
    user_signature = np.fromiter(gis.generate_signature(save_to_png(user_sketch_pic_base64, user_sketch_image))
    for document in call_back:
    	if sketch_tag in document['tags']:
        	results.append({'pic': document['base64'], 'signature': document['signature']})
	return sorted(results, key=compare)

