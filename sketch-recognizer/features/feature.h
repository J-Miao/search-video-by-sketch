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
#ifndef FEATURE_H
#define FEATURE_H

#include "common/types.h"

namespace sse {

/**
 * @brief The Feature class
 * The base class of all features
 */
class Feature
{
public:
    virtual void compute(const cv::Mat &image,
                         sse::KeyPoints_t &keypoints,
                         sse::Features_t &features) const = 0;
    /**
     * @brief scale: scale image as a suitable size
     *
     * @param image
     * @param scaled
     */
    virtual double scale(const cv::Mat &image, cv::Mat &scaled) const = 0;
    /**
     * @brief detect keypoints
     *
     * @param image
     * @param keypoints
     */
    virtual void detect(const cv::Mat &image, sse::KeyPoints_t &keypoints) const = 0;
    /**
     * @brief extract features from image
     *
     * @param image
     * @param keypoints
     * @param features
     * @param emptyFeatures
     */
    virtual void extract(const cv::Mat &image, const sse::KeyPoints_t &keypoints,
                         sse::Features_t &features, sse::Vec_Index_t &emptyFeatures) const = 0;
};

} //namspace sse

#endif // FEATURE_H
