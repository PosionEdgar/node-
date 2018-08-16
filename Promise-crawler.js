var http = require('http')

const fs = require('fs');

var Promise = require('bluebird')

var cheerio = require('cheerio')

var baseUrl = {

    "htmlUrl": 'http://www.imooc.com/learn/',

    "numberUrl": 'http://www.imooc.com/course/AjaxCourseMembers?ids='

};

videoIds = [348, 259, 197, 134, 75]



function filterChapters(html) {

    var $ = cheerio.load(html)

    var chapters = $('.chapter')

    var title = $('#main .course-infos .hd h2').text().trim();

    var courseData = {

        title: title,

        videos: []

    }

    chapters.each(function(item) {

        var chapter = $(this)

        var chapterTitle = chapter.find('h3').text().trim();

        var videos = chapter.find('.video').children('li')

        var chapterData = {

            chapterTitle,

            videos: []

        }



        videos.each(function(item) {

            var video = $(this).find('.J-media-item')

            var videoTitle = video.contents().filter(function() {

                return this.nodeType == 3;

            }).text().trim().split('\n');

            var id = video.attr('href').split('video/')[1].trim();



            chapterData.videos.push({

                title: videoTitle[0].trim(),

                id: id

            })

            //console.log(JSON.stringify(chapterData, undefined, 2));

        })



        courseData.videos.push(chapterData)

    })



    return courseData

}



function printCourseInfo(coursesData) {

    // console.log(coursesData);

    coursesData.forEach(function(courseData) {

        console.log(courseData.number + '人学过' + courseData.title + '\n')

    })



    coursesData.forEach(courseData => {

        // console.log('####' + courseData + '\n')

        courseData.videos.forEach(function(item) {

            var chapterTitle = item.chapterTitle



            console.log(chapterTitle + '\n')



            item.videos.forEach(function(video) {

                console.log('  [' + video.id + ']' + video.title + '\n')

            })

        })

    });

}



function getPageAsync(url) {

    return new Promise(function(resolve, reject) {

        console.log('*********正在爬取' + url + '*********')



        var html = ''

        var number = 0



        http.get(url.htmlUrl, function(res) {



            res.on('data', function(data) {

                html += data

            })



            res.on('end', function() {

                console.log("*************开始获取学习人数*************")

                http.get(url.numberUrl, function(res) {

                    var resData = '';

                    res.on('data', function(data) {

                        resData += data;

                    });

                    res.on('end', function(res) {

                        number = JSON.parse(resData).data[0].numbers;



                        resolve({

                            "html": html,

                            "number": number

                        })

                    })

                })



            }).on('error', function(e) {

                reject(e)

                console.log('获取数据出错')

            })

        })

    })

}



var fetchCourseArray = []



videoIds.forEach(function(id) {

    fetchCourseArray.push(getPageAsync({

        "htmlUrl": baseUrl.htmlUrl + id,

        "numberUrl": baseUrl.numberUrl + id

    }))

})



Promise.all(fetchCourseArray)

.then(function(pages) {

    var coursesData = []

    pages.forEach(function(page) {

        fs.writeFileSync('./index.html', page.html);

        var course = filterChapters(page.html)

        course.number = parseInt(page.number)

        coursesData.push(course)

    })

    coursesData.sort(function(a, b) {

        return a.number < b.number

    })



    printCourseInfo(coursesData)

})

// const html = fs.readFileSync('./index.html').toString();

// const result = filterChapters(html);