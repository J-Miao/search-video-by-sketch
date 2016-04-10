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
using namespace std;

#include "common/types.h"
#include "index/invertedindex.h"
#include "io/reader_writer.h"

using namespace sse;

void usages() {
    cout << "Usages: " <<endl
         << "  create_index -s samples -o output" <<endl
         << "  samples: \t samples file that has been quantized" <<endl
         << "  output: \t output file" <<endl;
}

int main(int argc, char* argv[])
{
    if(argc != 5) {
        usages();
        exit(1);
    }

 //   Samples_t samples;
 //   read(argv[2], samples, boost::bind(&print, _1, _2, "read samples "));

//    assert(samples.size() > 0);

//    uint vocabularySize = samples[0].size();

 //   InvertedIndex index(vocabularySize);


//    cout << "create index ..." << "\r" <<std::flush;
//    for(uint i = 0; i < samples.size(); i++) {
//        index.addSample(samples[i]);
//    }

    ifstream samples_in(argv[2]);
    uint samplesize = 0;
    samples_in >> samplesize;
    uint vocabularySize = 0;
    samples_in >> vocabularySize;

    InvertedIndex index(vocabularySize);

    assert(samplesize > 0 && vocabularySize > 0);

    cout << "add sample " << "\r" <<std::flush;
    Vec_f32_t sample(vocabularySize);
    for(uint i = 0; i < samplesize; i++) {

        for(int j = 0; j < vocabularySize; j++) {
            samples_in >> sample[j];
        }
        index.addSample(sample);
        cout << "add sample " << i <<"/" << samplesize << "\r" <<std::flush;
    }
    cout << "add sample " << samplesize <<"/" << samplesize << "\n" <<std::flush;
    cout << "create index ..." << "\r" <<std::flush;
    TF_simple tf;
    IDF_simple idf;
    index.createIndex(tf, idf);
    index.save(argv[4]);

    cout << "create index done." <<endl;

    return 0;
}
