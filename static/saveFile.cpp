#include <iostream>
#include <fstream>
#include <ctime>
using namespace std;

int main(int argc, char* argv[]) {
    ifstream source(argv[1], ios::binary);
    ofstream dest(argv[2], ios::binary);
    dest << source.rdbuf();
    source.close();
    dest.close();
    return 0;
}