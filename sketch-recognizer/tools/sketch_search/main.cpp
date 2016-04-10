/*************************************************************************
 * Copyright (c) 2014 Zhang Dongdong
 * All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**************************************************************************/
#include <iostream>
#include <string>
#include <dirent.h>
#include <libconfig.h++>

using namespace std;
using namespace libconfig;

#include <fstream>

#include "common/types.h"
#include "common/distance.h"
#include "features/galif.h"
#include "quantize/quantizer.h"
#include "io/reader_writer.h"
#include "index/invertedindex.h"
#include "io/filelist.h"

#include <boost/lexical_cast.hpp>

using namespace sse;

string F_INDEX = "";
string F_VOCABULARY = "";
string F_ROOTDIR = "";
string F_FILELIST = "";
int V_RESULTSNUM = 10;
string F_OUTPUT = "";


/*void usages()
{
    cout << "Usages: " <<endl
         << "  sketch_search -i indexfile -v vocabulary -d rootdir -f filelist -n resultsnum -o output" <<endl
         << "  indexfile: \t inverted index file" <<endl
         << "  vocabulary: \t vocabulary file"<<endl
         << "  rootdir: \t rootdir path"<<endl
         << "  filelist: \t filelist"<<endl
         << "  resultsnum: \t the number of results"<<endl
         << "  output: \t output file" <<endl;
}*/

void usages(){
    cout << "Usage: " << endl
    << "  sketch_search filename"  << endl;
}

void readConfig(){
    Config cfg;               /*Returns all parameters in this structure */
    try{
        cfg.readFile("config.ini");
    }
    catch(const FileIOException &fioex)
    {
        std::cerr << "No config found, use default." << std::endl;
        return;
    }
    catch(const ParseException &pex)
    {
        std::cerr << "Parse error at " << pex.getFile() << ":" << pex.getLine()
                  << " - " << pex.getError() << std::endl;
        return;
    }

    // Get the store name.
    try{
        string tmp = cfg.lookup("indexfile");
        F_INDEX = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
    try{
        string tmp = cfg.lookup("vocabulary");
        F_VOCABULARY = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
    try{
        string tmp = cfg.lookup("rootdir");
        F_ROOTDIR = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
    try{
        string tmp = cfg.lookup("filelist");
        F_FILELIST = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
    try{
        int tmp = cfg.lookup("resultsum");
        V_RESULTSNUM = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
    try{
        string tmp = cfg.lookup("output");
        F_OUTPUT = tmp;
    }
    catch(const SettingNotFoundException &nfex){}
}



int main(int argc, char *argv[])
{
    readConfig();
    if(argc != 2) {
        usages();
        exit(1);
    }

    InvertedIndex index;
    //index.load(argv[/]);
    index.load(F_INDEX);

    Vocabularys_t vocabulary;
    //read(argv[4], vocabulary, boost::bind(&print, _1, _2, "read vocabulary"));
    read(F_VOCABULARY, vocabulary);
    
    PropertyTree_t params;
    boost::shared_ptr<Galif> galif = boost::make_shared<Galif>(params);

    Quantizer_fn quantizer = QuantizerHard<Vec_f32_t, L2norm_squared<Vec_f32_t> >();

    TF_simple tf;
    IDF_simple idf;

    //FileList files(argv[6]);
    FileList files(F_ROOTDIR);
    //files.load(argv[8]);
    files.load(F_FILELIST);
    
    uint numOfResults;
    numOfResults = V_RESULTSNUM;

    /*
    try {
        numOfResults = boost::lexical_cast<uint>(argv[10]);
    } catch (boost::bad_lexical_cast&) {
        std::cerr << "bad parameter value: "<< argv[10] <<endl;
    }*/

    /*cout << ">> open sketch search :"<<endl;
    cout << ">> input absolute path, like \"/Users/zdd/zddhub.png\""<<endl;
    cout << ">> input q exit"<<endl;
    cout << ">> good luck!"<<endl;*/

    char filename[255];
    //while(true) {
        //cout << ">> ";
        //cin >> filename;

        /*if(filename[0] == 'q' && filename[1] == '\0')
            break;
        */
        //extract features
        KeyPoints_t keypoints;
        Features_t features;
        //cv::Mat image = cv::imread(filename);
        cv::Mat image = cv::imread(argv[1]);

        galif->compute(image, keypoints, features);

        //quantize
        Vec_f32_t query;
        quantize(features, vocabulary, query, quantizer);

        std::vector<ResultItem_t> results;
        index.query(query, tf, idf, numOfResults, results);

        //cout << "results:"<<endl;

        //ofstream out(argv[12]);
        for(uint i = 0; i < results.size(); i++) {
            //out << results[i].first << " " << files.getFilename(results[i].second).c_str()<<endl;
            cout << results[i].first << " " << files.getFilename(results[i].second).c_str()<<endl;
        }
        //out.close();
    //}
    return 0;
}

