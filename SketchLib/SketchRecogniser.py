import re
import subprocess

from flask import jsonify

idx_tag_dict = {0: 'ant', 514: 'mailbox', 4: 'catepella', 5: 'bee', 9: 'butterfly', 523: 'cyclinder', 526: 'vase', 16: 'spider', 1558: 'jeep', 27: 'bird', 86: 'dog', 1565: 'cart', 1797: 'fireplace', 1570: 'truck', 548: 'television', 1577: 'train', 48: 'duck', 50: 'goose', 53: 'fish', 573: 'carpet', 577: 'closet', 578: 'chip', 579: 'sign', 580: 'glasses', 587: 'microscope', 1100: 'wrench', 1615: 'skateboard', 592: 'sandclock', 82: 'snake', 1620: 'monster', 1109: 'hammer', 598: 'watch', 1113: 'screwdriver', 1626: 'hat', 603: 'lamp', 93: 'cat', 1118: 'biplane', 1632: 'helmet', 1040: 'tree', 98: 'pig', 103: 'horse', 617: 'streetlight', 1642: 'ladder', 109: 'rabbit', 1646: 'city', 625: 'guitar', 118: 'human', 1146: 'airplane', 642: 'piano', 1670: 'roadsign', 648: 'pistol', 1686: 'map', 669: 'rifle', 1698: 'box', 113: 'skeleton', 1705: 'door', 687: 'sword', 1733: 'stair', 715: 'knife', 1740: 'shoe', 1748: 'umbrella', 729: 'axe', 1754: 'snowman', 733: 'wheel', 1760: 'telephone', 1764: 'computer', 741: 'gear', 750: 'icecream', 1779: 'bridge', 1406: 'fighter', 763: 'table', 1789: 'book', 1793: 'swing', 773: 'bench', 267: 'dinosour', 1666: "Newton's", 1807: 'sink', 1811: 'radar', 277: 'turtle', 1302: 'Helicopter', 791: 'chair', 283: 'brain', 290: 'face', 1337: 'balloon', 829: 'sofa', 1589: 'chessboard', 323: 'hand', 1353: 'aircraft', 844: 'shelf', 1363: 'UFO', 340: 'face', 862: 'drawers', 870: 'table', 1388: 'satellite', 1597: 'chess', 1395: 'spaceship', 372: 'body', 376: 'skull', 1401: 'drone', 382: 'castle', 1411: 'tank', 389: 'church', 1803: 'slotmachine', 1427: 'boat', 411: 'temple', 423: 'house', 939: 'chair', 944: 'bed', 1463: 'submarine', 952: 'closet', 1472: 'bicycle', 961: 'Tree', 1099: 'shovel', 1478: 'motocycle', 970: 'flower', 1485: 'car', 463: 'skycrper', 468: 'lighttower', 473: 'tent', 989: 'potted', 482: 'bottle', 494: 'cup', 503: 'mug', 510: 'bucket'}
sorted_tag_idxes = [0, 4, 5, 9, 16, 27, 48, 50, 53, 82, 86, 93, 98, 103, 109, 113, 118, 267, 277, 283, 290, 323, 340, 372, 376, 382, 389, 411, 423, 463, 468, 473, 482, 494, 503, 510, 514, 523, 526, 548, 573, 577, 578, 579, 580, 587, 592, 598, 603, 617, 625, 642, 648, 669, 687, 715, 729, 733, 741, 750, 763, 773, 791, 829, 844, 862, 870, 939, 944, 952, 961, 970, 989, 1040, 1099, 1100, 1109, 1113, 1118, 1146, 1302, 1337, 1353, 1363, 1388, 1395, 1401, 1406, 1411, 1427, 1463, 1472, 1478, 1485, 1558, 1565, 1570, 1577, 1589, 1597, 1615, 1620, 1626, 1632, 1642, 1646, 1666, 1670, 1686, 1698, 1705, 1733, 1740, 1748, 1754, 1760, 1764, 1779, 1789, 1793, 1797, 1803, 1807, 1811]

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

def get_tag(pic_idx):
    start, end = 0, len(sorted_tag_idxes) - 1
    while start + 1 < end:
        mid = start + (end - start) / 2
        if sorted_tag_idxes[mid] > pic_idx:
            end = mid
        elif sorted_tag_idxes[mid] < pic_idx:
            start = mid
        else:
            start = mid
    if sorted_tag_idxes[start] <= pic_idx:
        return  idx_tag_dict[sorted_tag_idxes[start]]
    if sorted_tag_idxes[end] <= pic_idx:
        return idx_tag_dict[sorted_tag_idxes[end]]

def get_pic_idx(pic_path):
    match_obj = re.search(r"([0-9]{1,4}).png", pic_path)
    return int(match_obj.group(1))

def sketch_recogniser(filename):
    args = ("./static/sketch-recognizer/build/tools/bin/sketch_search", filename)
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    output = popen.stdout.read()
    results = []
    for idx, similarity_picpath_str in enumerate(output.split('\n')):
        if similarity_picpath_str:
            similarity, pic_path = similarity_picpath_str.strip().split(' ')
            results.append({"id": idx, "similarity": similarity, "img_url": pic_path, "tag": get_tag(get_pic_idx(pic_path))})
    return results





