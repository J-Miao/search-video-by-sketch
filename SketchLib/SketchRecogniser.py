from flask import jsonify

def sketch_recogniser():
    tests = [
                {
                    'id': 1,
                    'title': u'Buy groceries',
                    'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
                    'done': False
                },
                {
                    'id': 2,
                    'title': u'Learn Python',
                    'description': u'Need to find a good Python tutorial on the web', 
                    'done': False
                }
            ]
    return jsonify({"tests1": tests, "test2": tests})