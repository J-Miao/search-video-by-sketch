from flask import jsonify
from image_match.goldberg import ImageSignature

import base64
import numpy as np
import time
import subprocess
from math import sqrt

gis = ImageSignature()
user_sketch_image = "/home/search-video-by-sketch/static/img/user_sketch_img.png"
#user_sketch_image = "/home/search-video-by-sketch/static/sketch-recognizer/data/sketches_sbsr/images/1.png"
user_signature = np.array([])

def distance(a,b):
    suma = 0
    print len(a), "lena"
    print len(b), "lenb"
    for item in a:
	suma += item * item
    sumb = 0
    for item in b:
	sumb += item * item
    de = 0
    for i in range (len(a)):
	de += (a[i] - b[i]) * (a[i] - b[i])
    return sqrt(de) / (sqrt(suma) + sqrt(sumb))

def save_to_png(base64_str, file_name):
    f = open(file_name, 'wb')
    f.write(base64_str.decode("base64"))
    f.close()

    args = ("./static/copyfile", file_name)
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    
    return file_name

def compare(result_dict):
    return gis.normalized_distance(np.fromiter(result_dict['signature'],dtype='int8'), user_signature)

def picture_matcher(mongo, sketch_tag, user_sketch_pic_base64, sketch_file_path,  page_idx=0):
    call_back = mongo.db.vdb_images.find()
    results = []
    global user_signature 
    user_signature = gis.generate_signature(sketch_file_path)
    for document in call_back:
    	if sketch_tag in document['tags']:
           results.append({'pic': document['base64'], 'signature': document['signature']})
    return sorted(results, key=compare)

