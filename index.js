var Parser = function(){}

if (typeof window == "undefined" || !jQuery) {
	var cheerio = require("cheerio")
	var isBrowser = false
} else {
	var isBrowser = true
	window.Parser = Parser
}

function formatNumber(text) {
    try {
        var number;
        text = String(text)
        if (text.indexOf(',') !== -1) {
            text = text.replace(/,/, '');
        }
        // console.log("text " + text)
        if (text.indexOf('K') !== -1 || text.indexOf('k') !== -1) {
            number = parseInt(parseFloat(text.replace(/k/i)) * 1000);
        } else if (text.indexOf('M') !== -1) {
            number = parseInt(parseFloat(text.replace('M')) * 1000000);
        } else {
            number = parseInt(text);
        }

        return number;
    } catch (e) {
        console.log(e)
        return 0;
    }
}



//get posts list in current page
Parser.prototype.getPosts = function(){
	var $ = this.$
	var postsType1 = $('.fbUserContent._5pcr, .userContentWrapper').toArray() 
    var postsType2 = $('._307z').toArray() 

    if (postsType1.length>0) return postsType1
    if (postsType2.length>0) return postsType2
	return []
}

//check if posts is in group
Parser.prototype.isGroupPosts = function(){
	var $ = this.$
	var groupUrl = $('h1#seo_h1_tag > a').first();
	if (groupUrl.length && groupUrl.attr('href') && groupUrl.attr('href').indexOf('/groups/') > -1) {
        return true;
    }
    return false
}

Parser.prototype.getGroupInfo = function(){
	var $ = this.$
	if (this.isGroupPosts()){
		var groupID
		if ($('meta[property="al:android:url"]').eq(0).attr('content')){
			groupID = $('meta[property="al:android:url"]').eq(0).attr('content').replace('fb://group/', '')
		}
		if (!groupID && isNaN(groupID)){
			groupID = $('input[name="group_id"]').val()
		}

		return {
			id: groupID,
			name: $('h1#seo_h1_tag > a').eq(0).text().trim()
		}
	}
    return null
}

//get a post time
Parser.prototype.getPostTime = function($post){
	var postTime = $post.find('.clearfix a abbr[data-utime]').eq(0);
	return postTime.attr("data-utime")
}

Parser.prototype.getPostAuthor = function($post){
	var regxMatch;
	var id;
	var name;
	var url = $post.find('.clearfix a').eq(0).attr('data-hovercard');
	
	if (regxMatch = url.match(/id=\d+.*?/g)) {
		id = regxMatch[0].replace('id=', '');
    	return {
	        id: id,
	        name: $post.find('.clearfix a').eq(1).text()
	    }
	}
	return null;
}

Parser.prototype.getPostId = function($post){
	var postId = $post.find('form input[name=ft_ent_identifier]').val();
	var match = /^(\d+)$/;
    if (!match) {
        if (postId.indexOf(':') != -1) {
            postId = postId.split(':')[1];
        }
    }
    postId = postId ? postId : null;
	return postId
}

Parser.prototype.getFullPostID = function(toObject, groupInfo, postAuthor, postID){
	if (toObject && toObject.id) return toObject.id + "_" + postID
	if (groupInfo && groupInfo.id) return groupInfo.id + "_" + postID
	if (postAuthor && postAuthor.id) return postAuthor.id + "_" + postID
	return null
}

Parser.prototype.getPostContent = function($post){
	var content = $post.find(".userContent").eq(0).text() || $post.find("._4rmu").eq(0).text() 
	content = content.replace("See more","").replace("See More","")
	return content
}

Parser.prototype.getPostFeedback = function($post){
	var likeText = $post.find('.clearfix a._2x4v span').eq(0).text() || "0"
	
	
	var comment, share
	//pin post just show number of Comment (66 Comments)
	var shareText1 = $post.find('.UFIRow.UFIShareRow').text()

	//search posts page
	var shareText2 = $post.find('.fbSearchCompactUFI ._ipo').text()

	//
	var commentText1 = $post.find('.clearfix ._ipo ._36_q').text()

	//page/group
	var commentText2 =  $post.find('.UFIRow.UFIPagerRow').eq(0).text()

	if (shareText1){
		var regex = /([0-9,\.KM]+) share/
		var match = regex.exec(shareText1)
		if (match){
			share = match[1]
		}

		var regex = /([0-9,\.KM]+) Comment/
		var match = regex.exec(shareText1)
		if (match){
			comment = match[1]
		}
	} else if (shareText2){
		var regex = /([0-9,\.KM]+) Share/
		var match = regex.exec(shareText2)
		if (match){
			share = match[1]
		}

		var regex = /([0-9,\.KM]+) Comment/
		var match = regex.exec(shareText2)
		if (match){
			comment = match[1]
		}
	} 

	if (commentText1) {
		var regex = /([0-9,\.KM]+) Comment/
		var match = regex.exec(commentText1)
		if (match){
			comment = match[1]
		}

		var regex = /([0-9,\.KM]+) Share/
		var match = regex.exec(commentText1)
		if (match){
			share = match[1]
		}

	} else if (commentText2) {
		// Text comment feed back (2 of 150 | View 6 more comments)
		//type 1
		var regex = /of ([0-9,\.KM]+)/
		var match = regex.exec(commentText2)
		if (match)
			comment = match[1]
		else {
			// type 2
			var regex = /([0-9,\.KM]+) more comments/
			var match = regex.exec(commentText2)
			if (match){
				comment = Number(match[1])
			}
			//type 3
			var regex = /View all ([0-9,\.KM]+) comments/
			var match = regex.exec(commentText2)
			if (match){
				comment = Number(match[1])
			}
		}
	}

	// plus showing comment 
	if ($post.find('.UFIRow.UFIComment')){
		var commentShowCnt = $post.find('.UFIRow.UFIComment').toArray().length
		if (comment) {
			comment += commentShowCnt
		} else {
			comment = commentShowCnt
		}	
	}

	//share info
	var shareName ="", shareDescription="", shareCaption=""
	
	var shareInfoType1 = $post.find('._2ye0._5zwf').length
	if (shareInfoType1){
		shareName = $post.find('._2ye0._5zwf ._2ye1').text()
		shareCaption = $post.find('._2ye0._5zwf ._2ye3').text()
	}


	var shareInfoType2 = $post.find('div.mtm').length
	if (shareInfoType2){
		shareName = $post.find('div.mtm .mbs._6m6._2cnj._5s6c').text()
		shareDescription = $post.find('div.mtm ._6m7._3bt9').text()
		shareCaption = $post.find('div.mtm ._59tj._2iau').text()
	}

	
	return {
		likes: formatNumber(likeText || "0"),
		comments: formatNumber(comment || "0"),
		shares: formatNumber(share || "0"),
		name: shareName,
		description: shareDescription,
		caption: shareCaption,
	}
}

Parser.prototype.getPostType = function($post){
	if (this.isGroupPosts()) return {postType:"fbGroupTopic"}

	var firstObjLink = $post.find('.clearfix a').eq(0).attr('data-hovercard');
    if (firstObjLink) {
        if (firstObjLink.indexOf('/ajax/hovercard/page.php') > -1) {
            return {postType:"fbPageTopic"};
        }
    }

    //message A > B (A to B)
    var pageMessage = $post.find('.clearfix i u').eq(0).text()
    if (pageMessage==="to"){
    	var secondObjLink = $post.find('.clearfix a[data-hovercard]').eq(2).attr('data-hovercard');
    	var secondObjName = $post.find('.clearfix a[data-hovercard]').eq(2).text();
    	// console.log(secondObjLink + " name: " + secondObjName)
    	var regxMatch
	    if (secondObjLink) {
	        if (secondObjLink.indexOf('/ajax/hovercard/group.php') > -1) {
	        	if (regxMatch = secondObjLink.match(/id=\d+.*?/g)) {
					var groupID = regxMatch[0].replace('id=', '');
			    	var toObject = {
				        id: groupID,
				        name: secondObjName
				    }
	            	return {postType:"fbGroupTopic", toObject: toObject};
				}
	        }

	        if (secondObjLink.indexOf('/ajax/hovercard/page.php') > -1) {
	        	if (regxMatch = secondObjLink.match(/id=\d+.*?/g)) {
					var pageID = regxMatch[0].replace('id=', '');
			    	var toObject = {
				        id: pageID,
				        name: secondObjName
				    }
	           		return {postType:"fbPageTopic", toObject: toObject};
				}
	        }

	        if (secondObjLink.indexOf('/ajax/hovercard/user.php') > -1) {
	        	if (regxMatch = secondObjLink.match(/id=\d+.*?/g)) {
					var groupID = regxMatch[0].replace('id=', '');
			    	var toObject = {
				        id: groupID,
				        name: secondObjName
				    }
	            	return {postType:"fbUserTopic", toObject: toObject};
				}
	        }
	    }
    }

    //otherwise => user
    return {postType:"fbUserTopic"}

}

Parser.prototype.parse = function(html){
	var self = this
	if (!isBrowser)
		this.$ = cheerio.load(html) 
	else
		this.$ = jQuery

	var posts = this.getPosts()
	

	if (posts.length == 0) {
		console.log(`No posts found!`)
		return []
	}

	var groupInfo = this.getGroupInfo()

	var allPosts = []
	
	posts.map(function(post){
		
		var createTime = self.getPostTime(self.$(post))
		if (!createTime) return

		var postID = self.getPostId(self.$(post))
		var postAuthor = self.getPostAuthor(self.$(post))
		var {postType, toObject} = self.getPostType(self.$(post))
		var fullPostID = self.getFullPostID(toObject, groupInfo, postAuthor, postID)
		var message = self.getPostContent(self.$(post))

		var hasSeeMore = message.indexOf("See more") > -1 || 
						 message.indexOf("See More") > -1 || 
						 message.indexOf("Conitnue Reading") > -1 

		var feedback = self.getPostFeedback(self.$(post))
		

		
		
		allPosts.push({
			createTime: createTime,
			authorName: postAuthor.name,
			authorID: postAuthor.id,
			postID: postID,
			url: "http://facebook.com/" + fullPostID,
			content: message,

			likes: feedback.likes,
			comments: feedback.comments,
			shares: feedback.shares ,
			name: feedback.name || "",
			description: feedback.description || "",
			caption: feedback.caption || "",

			postType: postType,
		})
	})

	var urlList = {}
	for (var i = 0; i < allPosts.length; i++){
		if (urlList[allPosts[i].url]){
			var lastID = urlList[allPosts[i].url]
			if (allPosts[lastID].content) continue

			if (allPosts[i].content || allPosts[i].likes || allPosts[i].comments ) {
				urlList[allPosts[i].url] = i
			} 

		}else 
			urlList[allPosts[i].url] = i
	}

	var result = []
	for (var key in urlList){
		result.push(allPosts[urlList[key]])
	}

	console.log(`found ${result.length} posts`)
	printPost(result)
	return result
}

function printPost(posts){
	for (var i = 0; i < posts.length; i++){
		console.log(`\n============= post ${i+1} ==================`)
		for (var key in posts[i]){
			console.log(key + " " + posts[i][key])
		}

	}
}

exports = module.exports = Parser