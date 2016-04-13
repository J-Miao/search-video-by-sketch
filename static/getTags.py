from clarifai.client import ClarifaiApi

def getTags(file):
    # assumes environment variables are set.
    clarifai_api = ClarifaiApi() 
    result = clarifai_api.tag_images(f)
    #parsing Json
    res = []
    return result['results'][0]['result']['tag']['classes']

"""
f = open("/home/leetz/projects/pyssim/test-images/test1-1.png", "rb")
li = getTags(f)
for item in li:
    print item
"""