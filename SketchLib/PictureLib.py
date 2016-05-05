from flask import jsonify
from image_match.goldberg import ImageSignature

import subprocess
import base64
import numpy as np
import time
import re
import subprocess
import sys
import os

from math import sqrt

cur_path = os.path.dirname(__file__)

sys.path.append(os.path.abspath(os.path.join(cur_path, '../static/py-cbir/util/')))
sys.path.append(os.path.abspath(os.path.join(cur_path, '../static/py-cbir/')))

from findsimilar import get_global_vars
#gis = ImageSignature()
user_sketch_image = "/home/search-video-by-sketch/static/img/user_sketch_img.png"
#user_sketch_image = "/home/search-video-by-sketch/static/sketch-recognizer/data/sketches_sbsr/images/1.png"
user_signature = np.array([])

phash_alg, index_alg = get_global_vars()
    
def distance(a,b):
    suma = 0
    for item in a:
        suma += item * item
    
    sumb = 0
    for item in b:
        sumb += item * item
    
    de = 0
    for i in range (len(a)):
        de += (a[i] - b[i]) * (a[i] - b[i])
    return sqrt(de) / (sqrt(suma) + sqrt(sumb))

def dirty_copy_file(file_name):
    args = ("./static/copyfile", file_name)
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    output = popen.stdout.read()
    
def save_to_png(base64_str, file_name):
    f = open(file_name, 'wb')
    f.write(base64_str.decode("base64"))
    f.close()

    dirty_copy_file(file_name)
    
    return file_name

def compare(result_dict):
    return gis.normalized_distance(np.fromiter(result_dict['signature'], dtype='int8'), user_signature)

def str_to_list(string):
    return [string.lower() for string in string.split(',')]

def get_tag_from_file_path(file_path):
    print "file_path", file_path
    match_obj = re.search(r"pic_by_chris/([\w ]+)/", file_path)
    tag = match_obj.group(1)
    return tag.lower()

def picture_matcher(mongo, sketch_tag, file_path, page_idx=0):
    usr_tags = str_to_list(sketch_tag)
    results = []
    global phash_alg
    colorlists = phash_alg.search(file_path, False)
    # this list is a list of [(filename, similarity),(filename,similarity)]
    
    matched_files = ['static/' + file_similarity[0] for file_similarity in colorlists]
    for file in matched_files:
        file_tag = get_tag_from_file_path(file)
        if file_tag in usr_tags:
            results.append({'pic': file})
    if results:
        return results
    else:
        return [{'pic': file} for file in matched_files]
