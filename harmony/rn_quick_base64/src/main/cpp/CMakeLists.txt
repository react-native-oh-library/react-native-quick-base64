 # MIT License
 #
 # Copyright (C) 2024 Huawei Device Co., Ltd.
 #
 # Permission is hereby granted, free of charge, to any person obtaining a copy
 # of this software and associated documentation files (the "Software"), to deal
 # in the Software without restriction, including without limitation the rights
 # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 # copies of the Software, and to permit persons to whom the Software is
 # furnished to do so, subject to the following conditions:
 #
 # The above copyright notice and this permission notice shall be included in all
 # copies or substantial portions of the Software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 # SOFTWARE.

cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)
set (PACKAGE_NAME "quickbase64")
set (BUILD_DIR ${CMAKE_SOURCE_DIR}/build)
set (CMAKE_CXX_STANDARD 17)
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")

file(GLOB rnoh_quick_base64_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_quick_base64 SHARED ${rnoh_quick_base64_SRC})

target_include_directories(rnoh_quick_base64 PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_quick_base64 PUBLIC rnoh)
