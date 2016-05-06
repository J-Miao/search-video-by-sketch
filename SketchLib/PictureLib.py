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
import operator

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
    return [string.lower().strip() for string in string.split(',')]

def get_tag_from_file_path(file_path):
    print "file_path", file_path
    match_obj = re.search(r"pic_by_chris/([\w ]+)/", file_path)
    tag = match_obj.group(1)
    return tag.lower()

def get_shot_from_file_path(file_path):
    match_obj = re.search(r"/home/video_by_chris/([\w-]+) \d+.jpg", file_path)
    shot = match_obj.group(1)
    return shot

def collect_tag_motion(file_list):
    shot_tag_motion_dict = {}
    for shot_tag_motion in file_list:
        shot, tags, motion = shot_tag_motion
        shot_tag_motion_dict[shot] = {"tags": tags, "motion": motion}
    return shot_tag_motion_dict

def video_matcher(sketch_tag, obj_direction, file_path):
    usr_tags = str_to_list(sketch_tag)
    colorlists = phash_alg.search(file_path, False)
    shot_tag_motion_dict = collect_tag_motion(tl_callback)

    shot_stats = {}
    for file_similarity_tuple in colorlists:
        shot = get_shot_from_file_path(file_similarity_tuple[0])
        similarity = float(file_similarity_tuple[1])
        if shot_stats.get(shot, None):
            shot_stats[shot]["similarities"].append(similarity)
        else:
            shot_stats[shot] = {"similarities": [similarity], "max": 0, "sum": 0, "avg": 0}

    for shot, stats in shot_stats.items():
        similarities = shot_stats[shot]["similarities"]
        sim_max = max(similarities)
        sim_sum = sum(similarities)
        sim_cnt = len(similarities)
        sim_avg = sim_sum * 1.0 / sim_cnt
        shot_stats[shot]["max"] = sim_max
        shot_stats[shot]["avg"] = sim_avg
        shot_stats[shot]["sum"] = sim_sum

    def sim_comparator(shot1, shot2):
        if shot_stats[shot1]["max"] < 0.15:
            return -1
        elif shot_stats[shot1]["avg"] > shot_stats[shot2]["avg"]:
            return -1
        elif shot_stats[shot1]["avg"] < shot_stats[shot2]["avg"]:
            return 1
        elif shot_stats[shot1]["avg"] == shot_stats[shot2]["avg"]:
            return 0

    results = sorted(shot_stats.keys(), cmp=sim_comparator)

    def swap(lst, idx1, idx2):
        tmp = lst[idx1]
        lst[idx1] = lst[idx2]
        lst[idx2] = tmp
    
    i = tag_idx = 0

    while i < len(results):
        if set(shot_tag_motion_dict[results[i]]["tags"]).issubset(usr_tags):
            swap(results, i, tag_idx)
            tag_idx += 1
        i += 1

    i = direct_idx = 0

    while i < len(results):
        if shot_tag_motion_dict[results[i]]["motion"] == obj_direction:
            swap(results, i, direct_idx)
            direct_idx += 1
        i += 1

    return results

def picture_matcher(sketch_tag, file_path, page_idx=0):
    usr_tags = str_to_list(sketch_tag)
    print "usr_tags:", usr_tags
    results = []
    global phash_alg
    colorlists = phash_alg.search(file_path, False)
    # this list is a list of [(filename, similarity),(filename,similarity)]
    
    matched_files = ['static/' + file_similarity[0] for file_similarity in colorlists]

    matched_counts = []
   
    # handle the case if there are multiple tags:
    maxtags = 0
    for file in matched_files:
        file_tag = get_tag_from_file_path(file)
        tags = file_tag.split('_')
        tagsum = 0
        for t in tags:
            if t in usr_tags:
                tagsum += 1
        if tagsum > maxtags:
            maxtags = tagsum 
        matched_counts.append(tagsum)
    # handle 2D string
    print "maxtags:", maxtags
    for mt in reversed(range(maxtags + 1)):
        for i in range(len(matched_files)):
            if matched_counts[i] == mt:
                results.append({'pic': matched_files[i]})

    '''
    for file in matched_files:
        file_tag = get_tag_from_file_path(file)
        if file_tag in usr_tags:
            results.append({'pic': file})
    '''
    if results:
        #print "Here is results", results
        return results
    else:
	print "No match tag, no result!"
        return [{'pic': file} for file in matched_files]
