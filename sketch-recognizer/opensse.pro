#-------------------------------------------------------------------------
# Copyright (c) 2014 Zhang Dongdong
# All rights reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------
TEMPLATE = subdirs

SUBDIRS += \
    #opensse.pri \
    tests/test_galif \
    tests/test_reader_and_writer \
    tools/extract_descriptors \
    tools/generate_filelist \
    tools/generate_vocabulary \
    tools/quantize \
    tools/create_index \
    tools/sketch_search \
    gui/SketchSearchDemo \
    tests/test_similarity \
    tests/stat_vocab \
    tests/test_search \
    tools/extract_and_quantize

