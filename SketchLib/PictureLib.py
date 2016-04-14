from flask import jsonify
from image_match.goldberg import ImageSignature

import base64
import numpy as np

gis = ImageSignature()
#user_sketch_image = "../static/img/user_sketch_img.png"
user_sketch_image = "/home/search-video-by-sketch/static/sketch-recognizer/data/sketches_sbsr/images/1.png"
user_signature = None

def save_to_png(base64_str, file_name):
    f = open(file_name, 'w')
    f.write(base64_str.decode("base64"))
    f.close()
    return file_name

def compare(result_dict):
    print "result_dict", result_dict	
    return gis.normalized_distance(result_dict['signature'], user_signature)

def picture_matcher(mongo, sketch_tag, user_sketch_pic_base64, page_idx=0):
    call_back = mongo.db.vdb_images.find()
    #user_signature = gis.generate_signature(np.frombuffer(base64.decodestring(user_sketch_pic_base64), dtype=int), bytestream=True)
    results = []
    user_signature = gis.generate_signature(user_sketch_image)
    print "##### user_signature ###", user_signature
    for document in call_back:
    	if sketch_tag in document['tags']:
           results.append({'pic': document['base64'], 'signature': np.fromiter(document['signature'], dtype=int)})
    return sorted(results, key=compare)

