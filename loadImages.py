import sys
import os
import argparse
import numpy as np
import base64
from pymongo import MongoClient

client = MongoClient()
db = client.test

def load_all_images(dirname):
	for filename in os.listdir(dirname):
		name, ext = os.path.splitext(filename)
		if ext.lower() in [".png",".jpg",".bmp"]:
			pathname = os.path.join(dirname, filename)
			f = open(pathname, 'r')
			data = f.read()
			f.close()
			b64_string = base64.b64encode(data)
			#print b64_string
			result = db.vdb_images.insert({
					'base64': b64_string,
					signature: getSignature(data),
					tags: getTags(data)
				})

def main(): 
	parser = argparse.ArgumentParser()
	parser.add_argument('--add', help='add the directory of images')
	args = parser.parse_args() 
	if args.add: 
		load_all_images(args.add) 

if __name__ == "__main__": 
	main() 

