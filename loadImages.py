import sys
import os
import argparse
import numpy as np
import base64
from pymongo import MongoClient

from clarifai.client import ClarifaiApi
from image_match.goldberg import ImageSignature


# input parameter is open("path", "rb")
def getTags(file):
    # assumes environment variables are set.
    clarifai_api = ClarifaiApi() 
    result = clarifai_api.tag_images(file)
    #parsing Json
    res = []
    return result['results'][0]['result']['tag']['classes']


client = MongoClient()
db = client.test
#calculating signature
gis = ImageSignature()


def load_all_images(dirname):
	for filename in os.listdir(dirname):
		name, ext = os.path.splitext(filename)
		if ext.lower() in [".png",".jpg",".bmp", ".jpeg"]:
			pathname = os.path.join(dirname, filename)
			f = open(pathname, 'r')
			data = f.read()
			b64_string = base64.b64encode(data)
			#print b64_string

			result = db.vdb_images.insert({
			'base64': b64_string,
			# serialize signature into 1D array,pay attention to calling later
			'signature': gis.generate_signature(pathname).tolist(),
			'tags': getTags(f)
			})
			f.close()

def main(): 
	parser = argparse.ArgumentParser()
	parser.add_argument('--add', help='add the directory of images')
	args = parser.parse_args() 
	if args.add: 
		load_all_images(args.add) 

if __name__ == "__main__": 
	main() 

