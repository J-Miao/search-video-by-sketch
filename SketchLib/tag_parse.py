import sys

def tag_file_to_dict(filename):
	f = open(filename, 'rb')
	tag_str = f.read()
	tag_indexes = {int(num_tag.split(' ')[0]): ' '.join(num_tag.split(' ')[1:]) for num_tag in tag_str.split('\n')}
	return tag_indexes, sorted(tag_indexes)

if __name__ == "__main__":
	if len(sys.argv) < 2:
		print "Plz input tag file"
	else:
		print tag_file_to_dict(sys.argv[1])


