#
# Copyright 2016 The Open Source Research Group,
#                University of Erlangen-Nürnberg
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#FROM amos2016groupone/amos-ss16-proj1
#FROM scratch
FROM osrgroup/amos-downloader-base-image:1.0
MAINTAINER s.friedemann@gmx.net

ENV HTML_INDEX_FILE android-release-unsigned.apk
ADD assets/$HTML_INDEX_FILE /var/www/html/$HTML_INDEX_FILE
