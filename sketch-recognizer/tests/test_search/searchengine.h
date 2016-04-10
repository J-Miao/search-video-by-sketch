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
#ifndef SEARCHENGINE_H
#define SEARCHENGINE_H

#include <string>
#include <vector>

typedef unsigned int uint;

struct QueryResult
{
        std::string imageName;
        uint imageIndex;
        float ratio;

        bool operator< (const QueryResult& r) const
        {
                return ratio > r.ratio;
        }
};

typedef std::vector<QueryResult> QueryResults;

/**
 * @brief The SearchEngine class
 * Search engine interface
 */
class SearchEngine
{
public:
    virtual void query(const std::string &fileName, QueryResults& results) = 0;
};

#endif // SEARCHENGINE_H
